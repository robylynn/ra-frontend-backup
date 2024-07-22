import { WebSocket, WebSocketServer, ErrorEvent } from "ws";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/models/api_models";
import { getSession } from "next-auth/react";

export async function SOCKET(
  client: WebSocket,
  request: import("http").IncomingMessage,
  server: WebSocketServer
) {
  console.log("Websocket client connected.");

  const session = await getSession({ req: request });

  if (session != null && session.user.name != undefined) {
    console.log(
      `User \'${
        session?.user.name ?? "UNKNOWN"
      }\' authenticated for websocket connection.`
    );

    // if (session.user.name == null || session.user.name == undefined) {
    //   var a = 5;
    // }

    let backend_socket = new WebSocket("ws://127.0.0.1:8000/streams/socket");
    console.log("websocket created");

    const onBackendWebsocketClose = () => {
      console.log("Backend websocket closed");
      backend_socket.close();
      client.close();
    };

    const onBackendWebsocketMessage = (message: string) => {
      console.log(`Got message from backend: ${message}`);
      client.send(message);
    };

    const onBackendWebsocketError = (event: ErrorEvent) => {
      console.log("Got backend websocket error: " + event.message);
      client.close();
    };

    backend_socket.on("message", onBackendWebsocketMessage);
    backend_socket.on("close", onBackendWebsocketClose);
    // backend_socket.on("error", onBackendWebsocketError)
    backend_socket.onerror = onBackendWebsocketError;

    const onClientWebsocketClose = () => {
      console.log(`Client ${session?.user.name} closed the websocket`);
      client.close();
      backend_socket.close();
    };

    const onClientWebsocketMessage = (message: string) => {
      console.log(`Got message from client: ${message}`);
      backend_socket.send(message.toString());
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