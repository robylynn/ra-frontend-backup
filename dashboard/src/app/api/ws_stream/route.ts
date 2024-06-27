import { WebSocket, WebSocketServer } from "ws";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import authOptions from "@/lib/auth/auth_options";
import {
  createAPIResponse,
  BackendAPIResponse,
} from "@/lib/reusable_models/api_models";
import { getSession } from "next-auth/react";

export async function SOCKET(
  client: WebSocket,
  request: import("http").IncomingMessage,
  server: WebSocketServer
) {
  console.log("Websocket client connected.");

  const session = await getSession({ req: request });
  
  if (session != null || process.env.DISABLE_AUTHENTICATION) {
    console.log(
      `User \'${
        session?.user ?? "UNKNOWN"
      }\' authenticated for websocket connection.`
    );

    let backend_socket = new WebSocket("ws://127.0.0.1:8000/streams/socket");
    console.log("websocket created");

    const onBackendWebsocketClose = () => {
      console.log("Backend websocket closed");
      backend_socket.close();
    };

    const onBackendWebsocketMessage = (message: string) => {
      console.log(`Got message from backend: ${message}`);
      client.send(message);
    };

    backend_socket.on("message", onBackendWebsocketMessage);
    backend_socket.on("close", onBackendWebsocketClose);

    const onClientWebsocketClose = () => {
      console.log(`Client ${session?.user} closed the websocket`);
      backend_socket.close();
    };

    const onClientWebsocketMessage = (message: string) => {
      console.log(`Got message from client: ${message}`);
    };

    client.on("message", onClientWebsocketMessage);
    client.on("close", onClientWebsocketClose);
  } else {
    console.log("Client attemped unauthenticated websocket connection.");
    client.send("Unauthenticated.");
    client.terminate();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { stream_name: string; count: string } }
) {
  const session = await getServerSession(authOptions);

  if (session == null) {
    console.log(`Attempted websocket access without authentication`);
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
