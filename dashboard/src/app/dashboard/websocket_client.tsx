"use client";

// import { WebSocket } from "ws";
import { useWebSocket } from "next-ws/client";
import { useCallback, useEffect, useState } from "react";

export default function RAWebSocket() {
  const [value, setValue] = useState("");
  const ws = useWebSocket();
  var ws1: WebSocket;

  const onMessage = useCallback(
    (event: MessageEvent<Blob>) => console.log("event"),
    []
  );

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // ws1 = new WebSocket("ws://10.252.1.2:3000/api/ws_stream");
    ws1 = new WebSocket("/api/ws_stream");
    //ws1.send("test");
    ws1.onmessage = (event: MessageEvent<Blob>) => {
    //   console.log(`message: ${event.data.text().then((message) => message)}`);
    event.data.text().then(setMessage);  
    console.log("Got message");
    // console.log(`message: ${event.data.text().then(setMessage)}`);
    };
    ws1.onopen = () => {
      console.log("open");
    };
    
  }, []);

  useEffect(() => {
    console.log(`Got new message: ${message}`)
  }, [message]);

  return <></>;
}
