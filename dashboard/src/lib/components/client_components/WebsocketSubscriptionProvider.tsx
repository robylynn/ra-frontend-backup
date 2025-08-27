'use client';

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
    type?: string[];
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
                    if (!filter.type.some((s) => s.toLowerCase() === data.type))
                        matches = false;
                }
                if (matches) {
                    callback(data);
                }
            });
        };

        newWs.onclose = (event) => {
            setIsConnected(false);
            console.log('WebSocket disconnected:', event.code, event.reason);
            messageListeners.current.forEach(({ callback }) =>
                callback({ type: 'status', message: 'WebSocket disconnected.' })
            );

            reconnectAttempts.current++;
            setTimeout(() => {
                console.log(
                    `Attempting to reconnect... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
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
                messageListeners.current.forEach(({ callback }) =>
                    callback({
                        type: 'status',
                        message: `Sent subscribe for ${tableName}`,
                    })
                );
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
                messageListeners.current.forEach(({ callback }) =>
                    callback({
                        type: 'status',
                        message: `Sent unsubscribe for ${tableName}`,
                    })
                );
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

// --- New Component: Arbitrary Message Listener ---
// interface SpecialAlertComponentProps {
//     // Define any props this component might need
// }

// function SpecialAlertComponent({}: SpecialAlertComponentProps) {
//     const { registerMessageListener, isConnected } = useWebSocket();
//     const [lastSpecialMessage, setLastSpecialMessage] = useState<string | null>(
//         null
//     );
//     const alertCount = useRef(0);

//     // This effect registers and unregisters the listener
//     useEffect(() => {
//         if (!isConnected) return; // Only register if connected

//         const listenerId = 'special-alert-listener';
//         const callback = (message: WebSocketMessage) => {
//             // Define your arbitrary logic here.
//             // For example, if it's a 'live' message from 'special_alerts_table'
//             // or if it contains a specific flag in its data.
//             if (
//                 message.type === 'live' &&
//                 message.table === 'special_alerts_table' &&
//                 message.data?.severity === 'high'
//             ) {
//                 alertCount.current += 1;
//                 const alertText = `🚨 Special High Severity Alert (${alertCount.current}): ${JSON.stringify(message.data)}`;
//                 setLastSpecialMessage(alertText);
//                 console.log(alertText);
//                 // You can trigger other arbitrary actions here, e.g.,
//                 // playSoundEffect();
//                 // showToastNotification(alertText);
//             }
//         };

//         // Register to listen for 'live' messages from 'special_alerts_table'
//         const unsubscribe = registerMessageListener(listenerId, callback, {
//             type: ['live'],
//             table: 'special_alerts_table',
//         });

//         return () => {
//             unsubscribe(); // Clean up listener when component unmounts or isConnected changes
//         };
//     }, [isConnected, registerMessageListener]); // Re-register if connection status or register function changes

//     return (
//         <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
//             <h2 className="text-xl font-bold text-yellow-800 mb-2">
//                 Special Alert Monitor
//             </h2>
//             {lastSpecialMessage ? (
//                 <p className="text-yellow-700 font-medium whitespace-pre-wrap">
//                     {lastSpecialMessage}
//                 </p>
//             ) : (
//                 <p className="text-yellow-600 italic">
//                     Waiting for special high severity alerts from
//                     'special_alerts_table'...
//                 </p>
//             )}
//         </div>
//     );
// }

// // --- Main App Component (now a consumer of the context) ---
// function App() {
//     const {
//         isConnected,
//         clientId,
//         subscribedTables,
//         subscribe,
//         unsubscribe,
//         registerMessageListener,
//     } = useWebSocket();
//     const [inputTableName, setInputTableName] = useState<string>('');
//     const [messages, setMessages] = useState<WebSocketMessage[]>([]); // Messages moved to local state
//     const messagesEndRef = useRef<HTMLDivElement>(null);

//     // Effect to register a listener for ALL messages to populate the local 'messages' state
//     useEffect(() => {
//         const listenerId = 'app-message-log-listener';
//         const callback = (message: WebSocketMessage) => {
//             setMessages((prev) => [...prev, message]);
//         };
//         // Register without a filter to receive all messages
//         const unsubscribeListener = registerMessageListener(
//             listenerId,
//             callback
//         );

//         return () => {
//             unsubscribeListener(); // Clean up listener on unmount
//         };
//     }, [registerMessageListener]); // Depend on registerMessageListener

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     const handleSubscribe = () => {
//         if (inputTableName) {
//             subscribe(inputTableName);
//         }
//     };

//     const handleUnsubscribe = () => {
//         if (inputTableName) {
//             unsubscribe(inputTableName);
//         }
//     };

//     const renderMessage = (msg: WebSocketMessage, index: number) => {
//         let content;
//         let className = 'p-2 my-1 rounded-lg text-sm';

//         switch (msg.type) {
//             case 'historical':
//                 className += ' bg-blue-100 text-blue-800';
//                 content = (
//                     <>
//                         <span className="font-bold">
//                             HISTORICAL [{msg.table}]:
//                         </span>
//                         <pre className="whitespace-pre-wrap text-xs">
//                             {JSON.stringify(msg.data, null, 2)}
//                         </pre>
//                     </>
//                 );
//                 break;
//             case 'live':
//                 className += ' bg-green-100 text-green-800';
//                 content = (
//                     <>
//                         <span className="font-bold">LIVE [{msg.table}]:</span>
//                         <pre className="whitespace-pre-wrap text-xs">
//                             {JSON.stringify(msg.data, null, 2)}
//                         </pre>
//                     </>
//                 );
//                 break;
//             case 'status':
//                 className += ' bg-gray-100 text-gray-700 italic';
//                 content = (
//                     <>
//                         <span className="font-bold">STATUS:</span>{' '}
//                         {msg.message || `Table ${msg.table} is ${msg.status}.`}
//                     </>
//                 );
//                 break;
//             case 'error':
//                 className += ' bg-red-100 text-red-800 font-bold';
//                 content = (
//                     <>
//                         <span className="font-bold">ERROR:</span> {msg.message}
//                     </>
//                 );
//                 break;
//             default:
//                 className += ' bg-yellow-100 text-yellow-800';
//                 content = (
//                     <>
//                         <span className="font-bold">UNKNOWN:</span>
//                         <pre className="whitespace-pre-wrap text-xs">
//                             {JSON.stringify(msg, null, 2)}
//                         </pre>
//                     </>
//                 );
//         }
//         return (
//             <li key={index} className={className}>
//                 {content}
//             </li>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 font-inter antialiased flex flex-col items-center p-4">
//             <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-6 space-y-6">
//                 <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
//                     <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
//                         FastAPI ZeroMQ-like WebSocket Client
//                     </span>
//                 </h1>

//                 <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm">
//                     <span className="text-lg font-medium text-gray-700">
//                         Client ID:{' '}
//                         <span className="font-mono text-blue-600">
//                             {clientId || 'Connecting...'}
//                         </span>
//                     </span>
//                     <span
//                         className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                             isConnected
//                                 ? 'bg-green-200 text-green-800'
//                                 : 'bg-red-200 text-red-800'
//                         }`}
//                     >
//                         {isConnected ? 'Connected' : 'Disconnected'}
//                     </span>
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-4">
//                     <input
//                         type="text"
//                         className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150 ease-in-out"
//                         placeholder="Enter table name to subscribe/unsubscribe"
//                         value={inputTableName}
//                         onChange={(e) => setInputTableName(e.target.value)}
//                         disabled={!isConnected}
//                     />
//                     <div className="flex gap-2">
//                         <button
//                             onClick={handleSubscribe}
//                             disabled={
//                                 !isConnected ||
//                                 !inputTableName ||
//                                 subscribedTables.has(inputTableName)
//                             }
//                             className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             Subscribe
//                         </button>
//                         <button
//                             onClick={handleUnsubscribe}
//                             disabled={
//                                 !isConnected ||
//                                 !inputTableName ||
//                                 !subscribedTables.has(inputTableName)
//                             }
//                             className="px-5 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             Unsubscribe
//                         </button>
//                     </div>
//                 </div>

//                 <div className="mt-4">
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">
//                         Currently Subscribed Tables:
//                     </h2>
//                     {subscribedTables.size === 0 ? (
//                         <p className="text-gray-600 italic">
//                             No tables subscribed yet.
//                         </p>
//                     ) : (
//                         <div className="flex flex-wrap gap-2">
//                             {Array.from(subscribedTables).map((table) => (
//                                 <span
//                                     key={table}
//                                     className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
//                                 >
//                                     {table}
//                                     <button
//                                         onClick={() => unsubscribe(table)}
//                                         className="ml-2 text-purple-600 hover:text-purple-900 focus:outline-none"
//                                         title={`Unsubscribe from ${table}`}
//                                     >
//                                         &times;
//                                     </button>
//                                 </span>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* New Component Integrated Here */}
//                 <SpecialAlertComponent />

//                 <div className="mt-6">
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">
//                         Live Data Feed:
//                     </h2>
//                     <div className="h-96 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-y-auto shadow-inner">
//                         <ul className="space-y-2">
//                             {messages.map(renderMessage)}
//                             <div ref={messagesEndRef} />
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Wrap the App component with the WebSocketProvider at the root
// function RootApp() {
//     return (
//         <WebSocketProvider>
//             <App />
//         </WebSocketProvider>
//     );
// }

// export default RootApp;
