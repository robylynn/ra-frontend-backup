// Frontend Web Application for RA Products
// Developed by R2 Labs

import React, { useContext, ReactElement, useState, useRef, useEffect } from "react";
import { AxisData } from "@/lib/models/ros_models";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";


function AxisPoints(props: { 
    available_axes = Array<number>;
    axis_data: Array<number>;
}) : ReactElement{ 
    const { dashboardContext, setDashboardContext } = useContext(DashboardContext);

    return (
        <div>
            <h1> dashboardContext.axis_data </h1>
        </div>
    )
};

export default axis_point;

