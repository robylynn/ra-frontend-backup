'use server';

import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';

import { createAPIResponse } from '@/lib/models/api_models';
import { socketPassthrough } from '@/lib/utils/socketPassthrough';
import { decode } from '@auth/core/jwt';
import { NextApiRequest } from 'next';

function parseUrlQueryParams(urlString: string): Record<string, string> {
    const params: Record<string, string> = {};

    // Find the query string part of the URL.
    // We use `URL` constructor which can handle relative URLs if a base URL is provided,
    // or we can just extract the search part if the string starts with a '?'
    let queryString: string;
    if (urlString.startsWith('?')) {
        queryString = urlString;
    } else {
        // If it's a path like /api/socket?param=value, we need to extract the part after '?'
        const queryStartIndex = urlString.indexOf('?');
        if (queryStartIndex !== -1) {
            queryString = urlString.substring(queryStartIndex);
        } else {
            // No query string found
            return params;
        }
    }

    // Create a URLSearchParams object from the extracted query string.
    // The URLSearchParams constructor correctly handles the leading '?' if present.
    const searchParams = new URLSearchParams(queryString);

    // Iterate over the search parameters and populate the result object.
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }

    return params;
}

export async function SOCKET(
    client: WebSocket,
    request: NextApiRequest,
    server: WebSocketServer
) {
    // Extract the 'authjs.session-token' cookie from the request headers
    const cookiesHeader = request.headers.cookie;

    // Extract query parameters from the request
    // const query_params = request.query;
    const queryParameters = parseUrlQueryParams(request.url);
    console.log(`Query Params: ${queryParameters}`);

    let sessionCookieValue = null;
    let authenticatedPayload = null;
    if (cookiesHeader) {
        // Look for both 'authjs.session-token' and '__Secure-authjs.session-token'
        // The '__Secure-' prefix is added in production environments for secure cookies.
        const cookieParts = cookiesHeader.split(';').map((c) => c.trim());
        const sessionCookie = cookieParts.find(
            (c) =>
                c.startsWith('authjs.session-token=') ||
                c.startsWith('__Secure-authjs.session-token=')
        );

        if (sessionCookie) {
            sessionCookieValue = sessionCookie.substring(
                sessionCookie.indexOf('=') + 1
            );
        } else {
            console.log('[WS Debug] Session cookie not found in header.');
        }
    } else {
        console.log('[WS Debug] No cookie header found in request.');
    }

    if (sessionCookieValue) {
        const secret = process.env.AUTH_SECRET;

        if (!secret) {
            console.error('[WS] AUTH_SECRET environment variable is not set.');
            client.close(1011, 'Server Error: AUTH_SECRET missing'); // 1011: Internal Error
            return;
        }

        try {
            // The `decode` function expects the secret as a string directly.
            authenticatedPayload = await decode({
                token: sessionCookieValue,
                secret: secret,
                salt:
                    process.env.NODE_ENV === 'production'
                        ? '__Secure-authjs.session-token'
                        : 'authjs.session-token',
            });

            if (Date.now() >= authenticatedPayload.exp * 1000) {
                console.error(
                    'Websocket connection rejected due to expired token.'
                );
                authenticatedPayload = null;
            }
        } catch (decodeError) {
            console.error(
                '[WS] Error decoding session token with @auth/core/jwt decode:',
                decodeError
            );
            if (decodeError instanceof Error) {
                console.error(
                    '[WS Debug] Decode Error Message:',
                    decodeError.message
                );
            }
            authenticatedPayload = null; // Reset payload if decode failed
        }
    }

    // --- AUTHENTICATION CHECK FOR WEBSOCKET CONNECTION ---
    if (!authenticatedPayload) {
        console.warn(
            '[WS] Unauthorized WebSocket connection. Closing connection.'
        );
        // Close the WebSocket connection immediately if not authenticated.
        // Code 1008 is "Policy Violation".
        client.close(1008, 'Unauthorized');
        client.terminate();
        return; // Stop further execution for this unauthorized client
    }
    // --- END AUTHENTICATION CHECK ---

    const user = authenticatedPayload;
    const userId = user?.sub; // 'sub' (subject) is typically the user ID in JWTs
    const userName = user?.name || user?.email || 'Authenticated User'; // Use name or email from the token payload

    console.log(`[WS] Client connected: User ID: ${userId}, Name: ${userName}`);

    const target = queryParameters['target'];
    console.log(
        '[WS] Target Parameter:',
        target === undefined ? 'Undefined' : target
    );

    switch (target) {
        case 'ros':
            await socketPassthrough({
                socket_name: 'ros_websocket',
                proxy_address: `${process.env.ROS_HOST}:9090`,
                client: client,
                server: server,
                request: request,
            });
            break;
        case 'stream':
            // Build a base URL for the stream API
            //   let streamUrl = `${process.env.CONTROLLER_URI}/database/ws/data`;
            let streamUrl = `${process.env.CONTROLLER_URI}/database_stream/ws`;
            const streamParams = new URLSearchParams();

            // Append all query parameters from the original URL, except for 'target'
            for (const key in queryParameters) {
                if (key !== 'target') {
                    streamParams.append(key, queryParameters[key]);
                    // console.log(`  - Appending parameter: ${key}=${queryParameters[key]}`);
                }
            }

            const finalStreamUrl =
                streamUrl +
                (streamParams.toString() ? `?${streamParams.toString()}` : '');
            console.log(`[WS] Constructed stream URL: ${finalStreamUrl}`);

            await socketPassthrough({
                socket_name: 'streaming_websocket',
                proxy_address: finalStreamUrl,
                client: client,
                server: server,
                request: request,
            });
            break;
        default:
            console.log(`[WS] Warning: Unknown websocket target "${target}".`);
            break;
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { stream_name: string; count: string } }
) {
    console.error('Received GET request on socket endpoint.');

    return createAPIResponse({
        backend_response: null,
        authenticated: false,
    });
}
