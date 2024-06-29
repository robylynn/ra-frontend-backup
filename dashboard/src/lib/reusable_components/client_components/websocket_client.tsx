"use client";

import { useContext, useEffect, useState } from "react";
import DashboardContext from "@/lib/reusable_models/dashboard_context";

export default function RAWebSocket(props: {
  websocket_path: string,
  reconnect_period_seconds: number
}) {
  const { context, setContext } = useContext(DashboardContext);
  const [reconnectCounter, setReconnectCounter] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setReconnectCounter((counter) => counter + 1);
    }, props.reconnect_period_seconds * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setContext((c) => {
      if (c.ra_websocket == undefined) {
        console.log(`Attempting websocket connection to ${props.websocket_path}`)
        c.ra_websocket = new WebSocket(props.websocket_path);

        c.ra_websocket.onmessage = (event: MessageEvent<Blob>) => {
          event.data.text().then(setMessage);
          // console.log("Got websocket message");
        };

        c.ra_websocket.onclose = () => {
          setContext((c) => {
            c.ra_websocket = null;
            return c;
          });
        };
      }

      return c;
    });
  }, [reconnectCounter]);

  useEffect(() => {
    console.log(`Got new websocket message: ${message}`);
  }, [message]);

  return <></>;
}
