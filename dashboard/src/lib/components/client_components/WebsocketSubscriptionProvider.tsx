'use client';

import { logMessage } from '@/lib/utils/utilities';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

// Assuming your FastAPI server is running on localhost:8000
// const WEBSOCKET_URL = 'ws://10.1.0.7:8000/database/ws/zmq_stream';
const WEBSOCKET_URL = '/api/socket?target=stream';

// --- WebSocket Message Interfaces ---
export interface WebSocketMessage {
    type: 'historical' | 'live' | 'status' | 'error' | string; // Added 'string' for custom types
    table?: string;
    data?: any;
    message?: string;
    status?: 'subscribed' | 'unsubscribed';
}

export interface WebSocketMessageFilter {
    table?: string;
    types?: string[];
}

// --- WebSocket Context Definition ---
interface WebSocketContextType {
    isConnected: boolean;
    clientId: string;
    subscribedTables: Set<string>;
    subscribe: (
        tableName: string,
        sendHistorical?: boolean,
        historicalLimit?: number
    ) => void;
    unsubscribe: (tableName: string) => void;
    // New: Function to register callbacks for specific messages
    registerMessageListener: (
        listenerId: string,
        callback: (message: WebSocketMessage) => void,
        filter?: WebSocketMessageFilter
    ) => () => void; // Returns an unregister function
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
    undefined
);

// --- WebSocket Provider Component ---
interface WebSocketProviderProps {
    children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [clientId, setClientId] = useState<string>('');
    const [subscribedTables, setSubscribedTables] = useState<Set<string>>(
        new Set()
    );
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectInterval = 3000; // 3 seconds

    const wsRef = useRef<WebSocket | null>(null); // Use a ref to hold the WebSocket instance
    const subscribedTablesRef = useRef(subscribedTables); // Use a ref for subscribedTables inside useCallback
    // New: Ref to store all registered message listeners
    const messageListeners = useRef(
        new Map<
            string,
            {
                callback: (message: WebSocketMessage) => void;
                filter?: WebSocketMessageFilter;
            }
        >()
    );

    useEffect(() => {
        subscribedTablesRef.current = subscribedTables;
    }, [subscribedTables]);

    const connectWebSocket = useCallback(() => {
        if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error(
                'Max reconnect attempts reached. Please refresh the page.'
            );
            // No longer pushing to 'messages' state in provider, so this message
            // needs to be handled by a listener or the consumer of this component.
            // For now, it's just a console error.
            return;
        }

        const currentClientId = uuidv4();
        setClientId(currentClientId);

        const newWs = new WebSocket(WEBSOCKET_URL);
        wsRef.current = newWs; // Store in ref

        newWs.onopen = () => {
            setIsConnected(true);
            reconnectAttempts.current = 0;
            console.log(`WebSocket connected for client: ${currentClientId}`);
            // Notify listeners about connection status
            messageListeners.current.forEach(({ callback }) =>
                callback({
                    type: 'status',
                    message: `Connected to WebSocket as ${currentClientId}`,
                })
            );

            // Resubscribe to previous tables if reconnecting
            subscribedTablesRef.current.forEach((table) => {
                newWs.send(
                    JSON.stringify({
                        type: 'subscribe',
                        table_name: table,
                        send_historical: true,
                        historical_limit: 5,
                    })
                );
            });
        };

        newWs.onmessage = (event) => {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('Provider received:', data);
            // New: Distribute message to all registered listeners that match the filter
            messageListeners.current.forEach(({ callback, filter }) => {
                let matches = true;
                if (filter) {
                    if (filter.table && data.table !== filter.table)
                        matches = false;
                    if (
                        !filter.types.some((s) => s.toLowerCase() === data.type)
                    )
                        matches = false;
                }
                if (matches) {
                    callback(data);
                }
            });
        };

        newWs.onclose = (event) => {
            setIsConnected(false);
            logMessage(`WebSocket disconnected: ${event.code} $${event.reason}`, 'info');
            messageListeners.current.forEach(({ callback }) =>
                callback({ type: 'status', message: 'WebSocket disconnected.' })
            );

            reconnectAttempts.current++;
            setTimeout(() => {
                logMessage(
                    `Attempting to reconnect... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`, 'info'
                );
                connectWebSocket();
            }, reconnectInterval);
        };

        newWs.onerror = (error) => {
            console.error('WebSocket error:', error);
            messageListeners.current.forEach(({ callback }) =>
                callback({
                    type: 'error',
                    message: 'WebSocket error occurred.',
                })
            );
            newWs.close(); // Force close to trigger onclose and reconnection attempt
        };

        setWs(newWs);

        return () => {
            newWs.close();
        };
    }, []); // Empty dependency array means this useCallback is created once

    useEffect(() => {
        connectWebSocket();
        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connectWebSocket]);

    const subscribe = useCallback(
        (
            tableName: string,
            sendHistorical: boolean = true,
            historicalLimit: number = 5
        ) => {
            if (wsRef.current && isConnected) {
                const message = {
                    type: 'subscribe',
                    table_name: tableName,
                    send_historical: sendHistorical,
                    historical_limit: historicalLimit,
                };
                wsRef.current.send(JSON.stringify(message));
                // messageListeners.current.forEach(({ callback }) =>
                //     callback({
                //         type: 'status',
                //         message: `Sent subscribe for ${tableName}`,
                //     })
                // );
                setSubscribedTables((prev) => new Set(prev).add(tableName));
            } else {
                console.warn('WebSocket not connected. Cannot subscribe.');
                messageListeners.current.forEach(({ callback }) =>
                    callback({
                        type: 'error',
                        message: `WebSocket not connected. Cannot subscribe to ${tableName}.`,
                    })
                );
            }
        },
        [isConnected]
    );

    const unsubscribe = useCallback(
        (tableName: string) => {
            if (wsRef.current && isConnected) {
                const message = { type: 'unsubscribe', table_name: tableName };
                wsRef.current.send(JSON.stringify(message));
                // messageListeners.current.forEach(({ callback }) =>
                //     callback({
                //         type: 'status',
                //         message: `Sent unsubscribe for ${tableName}`,
                //     })
                // );
                setSubscribedTables((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(tableName);
                    return newSet;
                });
            } else {
                console.warn('WebSocket not connected. Cannot unsubscribe.');
                messageListeners.current.forEach(({ callback }) =>
                    callback({
                        type: 'error',
                        message: `WebSocket not connected. Cannot unsubscribe from ${tableName}.`,
                    })
                );
            }
        },
        [isConnected]
    );

    // New: Implementation of registerMessageListener
    const registerMessageListener = useCallback(
        (
            listenerId: string,
            callback: (message: WebSocketMessage) => void,
            filter?: WebSocketMessageFilter
        ) => {
            messageListeners.current.set(listenerId, { callback, filter });
            console.log(`Listener ${listenerId} registered.`);
            return () => {
                messageListeners.current.delete(listenerId);
                console.log(`Listener ${listenerId} unregistered.`);
            };
        },
        []
    );

    const contextValue: WebSocketContextType = {
        isConnected,
        clientId,
        subscribedTables,
        subscribe,
        unsubscribe,
        registerMessageListener,
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
}

// --- Custom Hook to use WebSocket Context ---
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
