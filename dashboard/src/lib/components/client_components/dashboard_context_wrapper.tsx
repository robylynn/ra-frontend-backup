// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { ReactNode, useState } from "react";

import DashboardContext, { ApplicationContext } from "@/lib/models/dashboard_context";

export default function DashboardContextProvider(props: {
  children: ReactNode;
}) {
  const [data, setData] = useState<ApplicationContext>(new ApplicationContext());

  return (
    <DashboardContext.Provider value={{ context: data, setContext: setData }}>
      {props.children}
    </DashboardContext.Provider>
  );
}
