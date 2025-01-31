// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, { useContext, ReactElement, useEffect } from "react";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";


function AxisPositions(props: { 
    available_axes: Array<number>;
}) : ReactElement{ 
    const { dashboardContext } = useContext(DashboardContext);

    // Side effect to monitor axis_data updates
    useEffect(() => {
      console.log("Axis data updated:", dashboardContext.axis_data);
    }, [dashboardContext.axis_data]);
  
    return (
      <div>
        <h1>Axis Data:</h1>
        <pre>{JSON.stringify(dashboardContext.axis_data, null, 2)}</pre>
      </div>
    );
};

export function AxisPositionContainer() {
    return (
        <AxisPositions
            available_axes={[0, 1, 2, 3]}
        />
    );
}