// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useState } from "react";

import MotionPlotPanel from "@/app/motion_plot/motion_plot_panel";

export default function ChartMainPanel(props: { className?: string }) {

    return (
        <MotionPlotPanel
            id={"motion_plot"}
            className={`w-full h-full peer-[:has(#control_fullscreen:checked)]:hidden`}
        />

    )

}