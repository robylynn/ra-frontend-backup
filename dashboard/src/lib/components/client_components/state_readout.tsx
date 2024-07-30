// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext } from "react";

import DashboardContext from "@/lib/models/dashboard_context";

export default function StateReadout(props: { className?: string }) {
  const { dashboardContext: context } = useContext(DashboardContext);

  return (
    <div>
      <p
        className={`text-center font-bold m-2 p-2 dark:bg-green-400 bg-red-400 rounded-xl ${
          props.className ?? ""
        }`}
      >
        {"NOT IMPLEMENTED"}
      </p>
    </div>
  );
}
