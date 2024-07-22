// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, useEffect, useState, useRef } from "react";
import DashboardContext from "@/lib/models/dashboard_context";
import { getSession } from "next-auth/react";

function connectWebSocket(url: string, timeout: number): Promise<WebSocket> {
  timeout = timeout || 2000;
  return new Promise(function (resolve, reject) {
    // Create WebSocket connection.
    const socket = new WebSocket(url);

    const timer = setTimeout(function () {
      reject(new Error("webSocket timeout"));
      done();
      socket.close();
    }, timeout);

    function done() {
      // cleanup all state here
      clearTimeout(timer);
      socket.removeEventListener("error", error);
    }

    function error(e: Event) {
      reject(e);
      socket.close();
      done();
    }

    socket.addEventListener("open", function () {
      resolve(socket);
      done();
    });
    socket.addEventListener("error", error);
  });
}

export default function RAWebSocket(props: {
  websocket_path: string;
  reconnect_period_seconds: number;
}) {
  const { context, setContext } = useContext(DashboardContext);
  const [reconnectCounter, setReconnectCounter] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const ra_websocket: React.MutableRefObject<null | WebSocket> = useRef(null);
  const websocket_connecting: React.MutableRefObject<boolean> = useRef(false);

  const close_websocket = () => {
    console.log("Closing websocket");
    websocket_connecting.current = false;
    if (ra_websocket.current != null && ra_websocket.current.OPEN) {
      ra_websocket.current.close();
    }
    ra_websocket.current = null;
    setContext((c) => {
      c.ra_websocket = ra_websocket.current;
      return c;
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setReconnectCounter((counter) => counter + 1);
    }, props.reconnect_period_seconds * 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // getSession().then((session) => {
    //   if (session != null) {
    if (ra_websocket.current == null && !websocket_connecting.current) {
      getSession().then((session) => {
        if (session != null) {
          websocket_connecting.current = true;
          connectWebSocket(props.websocket_path, 1000)
            .then((socket) => {
              socket.onmessage = (event: MessageEvent<Blob>) => {
                event.data.text().then(setMessage);
                // console.log("Got websocket message");
              };

              socket.onclose = () => {
                close_websocket();
              };

              socket.onerror = () => {
                console.log("Websocket error");
                close_websocket();
              };

              ra_websocket.current = socket;
              websocket_connecting.current = false;

              setContext((c) => {
                c.ra_websocket = ra_websocket.current;
                return c;
              });
            })
            .catch((err) => {
              console.log("Websocket connection error: " + err);
              websocket_connecting.current = false;
              ra_websocket.current = null;
              setContext((c) => {
                c.ra_websocket = ra_websocket.current;
                return c;
              });
            });
        } else {
          if (ra_websocket != null) {
            console.log("Session does not exist, closing socket");
            close_websocket();
          }
        }
      });
    }
  }, [reconnectCounter]);

  useEffect(() => {
    return () => {
      close_websocket();
    };
  }, []);

  useEffect(() => {
    console.log(`Got new websocket message: ${message}`);
  }, [message]);

  return <></>;
}
