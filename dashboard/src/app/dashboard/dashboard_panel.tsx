// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useState } from "react";

import DiagnosticsContainer from "@/app/diagnostics/diagnostics_container";
import IOConfigurationContainer from "@/app/io_configuration/io_configuration_container";
import IOPlotPanel from "@/app/io_plot/io_plot_panel";
import IOStateContainer from "@/app/io_state/io_state_container";
import MotionPlotPanel from "@/app/motion_plot/motion_plot_panel";
import JogPanel from "../jog_positions/jog_panel";
import { PagePanel } from "@/lib/components/client_components/DashboardHeaderContainer";

export default function DashboardMainPanel(props: { className?: string }) {
  const [fillTile, setFillTile] = useState<string>("");

  const grid_state = () =>
    fillTile == ""
      ? "grid grid-cols-[50%_50%] grid-rows-auto"
      : "grid grid-cols-1 grid-rows-1 h-full";

  const tile_hidden = (tile_name: string) =>
    fillTile != tile_name && fillTile != "" ? "hidden" : "";

  return (
    <PagePanel
      className={`
        ${grid_state()}
        gap-y-2
        transition-all
        overflow-y-scroll
        ${props.className ?? ""}
      `}
    >
      <JogPanel
        id="jogging_panel"
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${
          tile_hidden("jogging_panel")
        } ${fillTile === "jogging_panel" ? "h-full" : "min-h-[400px] overflow-y-auto"}`}
      />
      
      <IOConfigurationContainer
        id="io_configuration"
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${
          tile_hidden("io_configuration")
        } ${fillTile === "io_configuration" ? "h-full" : "min-h-[400px] overflow-y-auto"}`}
        fill_tile_callback={setFillTile}
      />

      <IOPlotPanel
        id="io_plot"
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "io_plot"
        )}`}
        fill_tile_callback={setFillTile}
      />

      <MotionPlotPanel
        id="motion_plot"
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "motion_plot"
        )}`}
        fill_tile_callback={setFillTile}
      />
    </PagePanel>
  );
}
