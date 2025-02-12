// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, { useContext, ReactElement, useEffect } from "react";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";

function AxisPositions(props: { available_axes: Array<number> }): ReactElement {
    const { dashboardContext } = useContext(DashboardContext);

    // Log axis_data whenever it updates
    // useEffect(() => {
    //     console.log("Axis data updated:", dashboardContext.axis_data);
    // }, [dashboardContext.axis_data]);


    return (
        <div className="p-2 bg-gray-900 text-white rounded-lg shadow-lg border border-r2-green-300">         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {props.available_axes.map((axis) => {
                    const axisInfo = dashboardContext.axis_data?.[axis];
                    return (
                        <div
                            key={axis}
                            className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            <h2 className="text-lg font-semibold text-gray-200 mb-2">
                                Axis {axis}
                            </h2>
                            {axisInfo ? (
                                <>
                                    <p className="text-lg text-gray-400">
                                        Position:{" "}
                                        <span className="text-blue-400 font-medium">
                                            {axisInfo.position.toFixed(2)}
                                        </span>
                                    </p>
                                    <p className="text-lg text-gray-400">
                                        Velocity:{" "}
                                        <span className="text-green-400 font-medium">
                                            {axisInfo.velocity.toFixed(2)}
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    No data available for this axis.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function AxisPositionContainer() {
    return <AxisPositions available_axes={[0, 1, 2, 3]} />;
}
