'use server';

// import { getSession } from 'next-auth/react';
import { debug_mode } from '@/lib/utils/utilities';
import { IncomingMessage } from 'http';
import { ErrorEvent, WebSocket, WebSocketServer } from 'ws';

export async function socketPassthrough(props: {
    socket_name: string;
    proxy_address: string;
    client: WebSocket;
    request: IncomingMessage;
    server: WebSocketServer;
}) {
    const format_message = (message) => {
        return `${props.socket_name.toUpperCase()}: ${message}`;
    };

    if (debug_mode())
        console.log(format_message('Websocket client connected.'));

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

    if (debug_mode())
        console.log(format_message('Proxy target websocket created'));

    const onBackendWebsocketClose = () => {
        console.warn(format_message('Proxy target websocket closed.'));
        backend_socket.close();
        props.client.close();
    };

    const onBackendWebsocketMessage = (message: string) => {
        if (process.env.DEBUG.toLowerCase() == 'true')
            console.log(
                format_message(
                    `Got message from proxy target websocket: ${message}`
                )
            );
        props.client.send(message.toString());
    };

    const onBackendWebsocketError = (event: ErrorEvent) => {
        console.error(
            format_message('Proxy target websocket error: ' + event.message)
        );
        props.client.close();
    };

    backend_socket.on('message', onBackendWebsocketMessage);
    backend_socket.on('close', onBackendWebsocketClose);
    backend_socket.onerror = onBackendWebsocketError;

    const onClientWebsocketClose = () => {
        console.warn(
            format_message(
                // `Client ${session?.user.name} closed the proxy websocket`
                `Client closed the proxy websocket`
            )
        );
        props.client.close();
        backend_socket.close();
    };

    const onClientWebsocketMessage = (message: string) => {
        if (debug_mode())
            console.log(
                format_message(
                    `Got message from client on proxy websocket: ${message}`
                )
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
