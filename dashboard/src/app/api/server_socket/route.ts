import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';

import authOptions from '@/lib/auth/auth_options';
import { createAPIResponse } from '@/lib/models/api_models';
import { socketPassthrough } from '@/lib/utils/socketPassthrough';

export async function SOCKET(
    client: WebSocket,
    request: import('http').IncomingMessage,
    server: WebSocketServer
) {
    await socketPassthrough({
        socket_name: 'server_websocket',
        proxy_address: '127.0.0.1:8000',
        client: client,
        server: server,
        request: request,
    });
}

export async function GET(
    req: NextRequest,
    { params }: { params: { stream_name: string; count: string } }
) {
    const session = await getServerSession(authOptions);

    if (session == null) {
        console.log(`Attempted server websocket access without authentication`);
        return createAPIResponse({
            data: null,
            authenticated: false,
        });
    }

    return createAPIResponse({
        data: null,
        authenticated: true,
    });
}
