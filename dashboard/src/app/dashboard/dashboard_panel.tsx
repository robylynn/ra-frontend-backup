// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useState } from "react";
import { PagePanel } from "@/lib/components/client_components/dashboard_header_container";
import DiagnosticsContainer from "@/app/diagnostics/diagnostics_container";
import ROSContainer from "@/app/ros/ros_container";
import IOStateContainer from "@/app/io_state/io_state_container";

export default function DashboardMainPanel(props: { className?: string }) {
  const [fillTile, setFillTile] = useState<string>("");

  const grid_state = () =>
    // fillTile == "" ? "grid grid-cols-[35%_30%_35%] grid-rows-2" : "";
    fillTile == "" ? "grid grid-cols-[50%_50%] grid-rows-2" : "";
  const tile_hidden = (tile_name: string) =>
    fillTile != tile_name && fillTile != "" ? "hidden" : "";

  return (
    <PagePanel
      className={`
        ${grid_state()}
        gap-y-2
        transition-all
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
      <ROSContainer
        id={"ros"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "ros"
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
    </PagePanel>
  );
}
