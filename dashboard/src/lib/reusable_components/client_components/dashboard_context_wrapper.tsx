// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { ReactNode, useState } from "react";

import { UIConfiguration } from "@/lib/reusable_models/api_models";
import DashboardContext, { DashboardContextObject } from "@/lib/reusable_models/dashboard_context";
import { DashboardContextInterface } from "@/lib/reusable_models/dashboard_context";
import {
  DatabaseDocument,
  DatabaseIOStateArray,
  DatabaseMessageArray,
} from "@/lib/reusable_models/database_models";

export default function DashboardContextProvider(props: {
  children: ReactNode;
}) {
  // const [data, setData] = useState<DashboardContextInterface>({
  //   latest_document: new DatabaseDocument(),
  //   configuration: new UIConfiguration(),
  //   messages: new DatabaseMessageArray(),
  //   io_state: new DatabaseIOStateArray(),
  //   heartbeat: false,
  //   database_online: false,
  //   ra_websocket: new WebSocket("/api/socket")
  //   // ra_websocket: null
  // });

  const [data, setData] = useState<DashboardContextObject>(new DashboardContextObject());

  return (
    <DashboardContext.Provider value={{ context: data, setContext: setData }}>
      {props.children}
    </DashboardContext.Provider>
  );
}
