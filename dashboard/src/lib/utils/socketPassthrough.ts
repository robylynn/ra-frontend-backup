'use server';

import { logMessage } from '@/lib/utils/utilities';
import { IncomingMessage } from 'http';
import { ErrorEvent, WebSocket, WebSocketServer } from 'ws';

export async function socketPassthrough(props: {
    socket_name: string;
    proxy_address: string;
    client: WebSocket;
    request: IncomingMessage;
    server: WebSocketServer;
}) {
    const socket_name = props.socket_name.toUpperCase();

    logMessage(
        'Websocket client connected to passthrough.',
        'debug',
        `${socket_name}`
    );

    let backend_socket = new WebSocket(`ws://${props.proxy_address}`);

    const onBackendWebsocketClose = () => {
        logMessage(
            'Proxy target websocket closed',
            'warning',
            `${socket_name}`
        );
        props.client.close();
    };

    const onBackendWebsocketMessage = (message: WebSocket.Data) => {
        logMessage(
            `Got message from proxy target websocket: ${message}`,
            'silent',
            `${socket_name}`
        );
        props.client.send(message.toString());
    };

    const onBackendWebsocketError = (event: ErrorEvent) => {
        logMessage(
            `Proxy target websocket error: ${event.message}`,
            'error',
            socket_name
        );
        props.client.close();
    };

    const onBackendWebsocketOpen = () => {
        logMessage(`Backend websocket opened`, 'debug', socket_name);
    }

    backend_socket.on('open', onBackendWebsocketOpen);
    backend_socket.on('message', onBackendWebsocketMessage);
    backend_socket.on('close', onBackendWebsocketClose);
    backend_socket.on('error', onBackendWebsocketError);

    const onClientWebsocketClose = () => {
        logMessage('Client closed the proxy websocket', 'warning', socket_name);
        backend_socket.close();
    };

    const onClientWebsocketMessage = (message: WebSocket.Data) => {
        logMessage(
            `Got message from client on proxy websocket: ${JSON.stringify(message)}`,
            'silent',
            socket_name
        );
        
        if (backend_socket.readyState == WebSocket.OPEN)
            backend_socket.send(message.toString());
        else
            logMessage(
                `Cannot send message from client through passthrough since backend websocket is not open.`,
                'warning',
                socket_name
            );
    };

    const onClientWebsocketError = (event: ErrorEvent) => {
        logMessage(
            `Client websocket error: ${event.message}`,
            'error',
            socket_name
        );
        
        props.client.close();
        backend_socket.close();
    };

    props.client.on('message', onClientWebsocketMessage);
    props.client.on('close', onClientWebsocketClose);
    props.client.on('error', onClientWebsocketError);
}
