'use server';

// import { getSession } from 'next-auth/react';
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
    // const format_message = (message) => {
    //     return `${props.socket_name.toUpperCase()}: ${message}`;
    // };
    const socket_name = props.socket_name.toUpperCase();

    // if (debug_mode())
    //     console.log(format_message('Websocket client connected.'));
    logMessage(
        'Websocket client connected to passthrough.',
        'debug',
        `${socket_name}`
    );

    // const session = await getSession({ req: props.request });
    // const session = await getSession();
    // await auth().then((session) => {
    // if (props.request..)
    // if (session != null && session.user.name != undefined) {
    // if (true) {
    // console.log(
    //     format_message(
    //         `User \'${
    //             session?.user.name ?? 'UNKNOWN'
    //         }\' authenticated for websocket connection.`
    //     )
    // );

    let backend_socket = new WebSocket(`ws://${props.proxy_address}`);

    // if (debug_mode())
    //     console.log(format_message('Proxy target websocket created'));
    // logMessage('Proxy target websocket closed', 'debug', 'ROS')

    const onBackendWebsocketClose = () => {
        // console.warn(format_message('Proxy target websocket closed.'));
        logMessage(
            'Proxy target websocket closed',
            'warning',
            `${socket_name}`
        );
        backend_socket.close();
        props.client.close();
    };

    const onBackendWebsocketMessage = (message: string) => {
        // if (process.env.DEBUG.toLowerCase() == 'true')
        //     console.log(
        //         format_message(
        //             `Got message from proxy target websocket: ${message}`
        //         )
        //     );
        logMessage(
            `Got message from proxy target websocket: ${message}`,
            'silent',
            `${socket_name}`
        );
        props.client.send(message.toString());
    };

    const onBackendWebsocketError = (event: ErrorEvent) => {
        // console.error(
        //     format_message('Proxy target websocket error: ' + event.message)
        // );
        logMessage(
            `Proxy target websocket error: ${event.message}`,
            'error',
            socket_name
        );
        props.client.close();
    };

    backend_socket.on('message', onBackendWebsocketMessage);
    backend_socket.on('close', onBackendWebsocketClose);
    backend_socket.onerror = onBackendWebsocketError;

    const onClientWebsocketClose = () => {
        // console.warn(
        //     format_message(
        //         // `Client ${session?.user.name} closed the proxy websocket`
        //         `Client closed the proxy websocket`
        //     )
        // );
        logMessage('Client closed the proxy websocket', 'warning', socket_name);
        props.client.close();
        backend_socket.close();
    };

    const onClientWebsocketMessage = (message: string) => {
        // if (debug_mode())
        //     console.log(
        //         format_message(
        //             `Got message from client on proxy websocket: ${message}`
        //         )
        //     );
        logMessage(
            `Got message from client on proxy websocket: ${JSON.stringify(message)}`,
            'silent',
            socket_name
        );
        backend_socket.send(message.toString());
    };

    props.client.on('message', onClientWebsocketMessage);
    props.client.on('close', onClientWebsocketClose);
    // } else {
    //     console.error(
    //         format_message(
    //             'Client attemped unauthenticated websocket connection.'
    //         )
    //     );
    //     props.client.send('Unauthenticated.');
    //     props.client.terminate();
    // }
}
