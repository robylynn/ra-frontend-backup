// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { ReactNode, useState } from "react";

import DashboardContext, { ApplicationContext } from "@/lib/models/dashboard_context";
import RAStateContext, { StateContext } from "@/lib/models/ros_state_context";

export default function DashboardContextProvider(props: {
  children: ReactNode;
}) {
  const [data, setData] = useState<ApplicationContext>(new ApplicationContext());

  return (
    <DashboardContext.Provider value={{ dashboardContext: data, setContext: setData }}>
      {props.children}
    </DashboardContext.Provider>
  );
}

export function RAStateContextProvider(props: {
  children: ReactNode;
}) {
  const [data, setData] = useState<StateContext>(new StateContext());

  return (
    <RAStateContext.Provider value={{ stateContext: data, setContext: setData }}>
      {props.children}
    </RAStateContext.Provider>
  );
}
