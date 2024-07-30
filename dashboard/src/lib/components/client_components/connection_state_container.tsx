// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";

import DashboardContext from "@/lib/models/dashboard_context";

export default function ConnectionStateIndicator(props: { className?: string }) {
  const { dashboardContext: context } = useContext(DashboardContext);
  const [isClient, setIsClient] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    setIsClient(() => true);
  }, []);

  const connected_color =
    context.heartbeat && session ? "bg-r2-green-500" : "bg-r2-red-300";
  const connection_text = session
    ? `BACKEND SERVER ${context.heartbeat ? "ONLINE" : "OFFLINE"}`
    : "NOT LOGGED IN";

  const websocket_text = () => {
    let websocket_connected = context.ra_websocket ? true : false;
    
    let text = context.ra_websocket ? "WEBSOCKET CONNECTED" : "WAITING FOR WEBSOCKET"

    return (
      <p className={`py-0 m-0 mx-2 font-bold text-center rounded-md text-r2-white ${websocket_connected ? "bg-r2-green-500" : "bg-r2-red-300"}`}>{text}</p>
    )
  }

  return (
    <div
      className={`w-full h-fit px-2 grid grid-cols-3 justify-between bg-none items-center text-sm ${
        props.className ?? ""
      }`}
    >
      {websocket_text()}
      <p
        className={`px-2 text-center text-r2-white font-bold rounded-md py-0 m-0 ${connected_color}`}
      >
        {connection_text}
      </p>
      <p className="py-0 m-0 text-xs text-center text-r2-white">{`SYSTEM TIME: ${
        isClient
          ? new Date().toString().toUpperCase()
          : "WAITING FOR CLIENT RENDER"
      }`}</p>
    </div>
  );
}
