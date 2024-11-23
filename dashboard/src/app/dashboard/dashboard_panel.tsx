// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useState } from "react";
import { PagePanel } from "@/lib/components/client_components/DashboardHeaderContainer";
import DiagnosticsContainer from "@/app/diagnostics/diagnostics_container";
// import ROSContainer from "@/app/io_configuration/io_configuration_container";
import IOConfigurationContainer from "@/app/io_configuration/io_configuration_container";
import IOStateContainer from "@/app/io_state/io_state_container";
import AnalogInputPlotContainer from "@/app/analog_input_plot/analog_input_plot_container";
import MotionPlotPanel from "@/app/motion_plot/motion_plot_panel";
// import IOPlotContainer from "../io_plot/io_plot_container";
import IOPlotPanel from "@/app/io_plot/io_plot_panel";

export default function DashboardMainPanel(props: { className?: string }) {
  const [fillTile, setFillTile] = useState<string>("");

  const grid_state = () =>
    // fillTile == "" ? "grid grid-cols-[35%_30%_35%] grid-rows-2" : "";
    fillTile == "" ? "grid grid-cols-[50%_50%] grid-rows-auto" : "";
    // fillTile == "" ? "flex flex-col" : "";
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
      <DiagnosticsContainer
        id={"diagnostics"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "diagnostics"
        )}`}
        fill_tile_callback={setFillTile}
      />
      <IOConfigurationContainer
        id={"io_configuration"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "io_configuration"
        )}`}
        fill_tile_callback={setFillTile}
      />
      <IOStateContainer
        id={"io_state"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "io_state"
        )}`}
        fill_tile_callback={setFillTile}
      />
      
      {/* <IOPlotPanel
        id={"io_plot"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "io_plot"
        )}`}
        fill_tile_callback={setFillTile}
      /> */}

      {/* <AnalogInputPlotContainer
        id={"analog_input_plot"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "analog_input_plot"
        )}`}
        fill_tile_callback={setFillTile}
      /> */}
      
      <MotionPlotPanel
        id={"motion_plot"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "motion_plot"
        )}`}
        fill_tile_callback={setFillTile}
      />

    </PagePanel>
  );
}
