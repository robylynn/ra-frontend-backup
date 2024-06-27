// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { useState } from "react";

import { ChartPanelContainer } from "@/app/charts/chart_panel_container";
import { ControlLoopsContainer } from "@/app/control_loops/control_loops_container";
import ControlContainer from "@/app/controls/control_container";
import { MeasurementsContainer } from "@/app/measurement/measurements_container";
import { SafetyContainer } from "@/app/safety/safety_container";
import { SetupContainer } from "@/app/setup/setup_container";
import { PagePanel } from "@/lib/reusable_components/client_components/dashboard_header_container";
import DeviceContainer from "@/app/devices/devices_container";
import DiagnosticsContainer from "../diagnostics/diagnostics_container";
import RAWebSocket from "./websocket_client";
import { WebSocketProvider } from 'next-ws/client';

export default function DashboardMainPanel(props: { className?: string }) {
  const [fillTile, setFillTile] = useState<string>("");

  const grid_state = () =>
    // fillTile == "" ? "grid grid-cols-[35%_30%_35%] grid-rows-2" : "";
    fillTile == "" ? "grid grid-cols-[50%_50%] grid-rows-1" : "";
  const tile_hidden = (tile_name: string) =>
    fillTile != tile_name && fillTile != "" ? "hidden" : "";

  return (
    <WebSocketProvider
          url="ws://127.0.0.1:3000/api/ws_stream"
    >
    <PagePanel
      className={`
        ${grid_state()}
        gap-y-2
        transition-all
        ${props.className ?? ""}
        `}
    >
      {/* <DeviceContainer
        id={"devices"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "devices",
        )}`}
        fill_tile_callback={setFillTile}
      /> */}
      <RAWebSocket/>
      <ChartPanelContainer
        id="charts"
        update_period_seconds={2}
        className={`${tile_hidden("charts")}`}
        fill_tile_callback={setFillTile}
      />
      <DiagnosticsContainer
        id={"diagnostics"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "diagnostics",
        )}`}
        fill_tile_callback={setFillTile}
      />

      {/* <ControlContainer
        id={"control"}
        className={`peer-[:has(#control_fullscreen:checked)]:hidden ${tile_hidden(
          "control",
        )}`}
        fill_tile_callback={setFillTile}
      />
      <SafetyContainer
        id="safety"
        className={`${tile_hidden("safety")}`}
        fill_tile_callback={setFillTile}
      />
      <MeasurementsContainer
        id="measurements"
        className={`${tile_hidden("measurements")}`}
        fill_tile_callback={setFillTile}
      />
      <ControlLoopsContainer
        id="control_loops"
        className={`${tile_hidden("control_loops")}`}
        fill_tile_callback={setFillTile}
      />
      <SetupContainer
        id="setup"
        className={`${tile_hidden("setup")}`}
        fill_tile_callback={setFillTile}
      />
      <ChartPanelContainer
        id="charts"
        update_period_seconds={2}
        className={`${tile_hidden("charts")}`}
        fill_tile_callback={setFillTile}
      /> */}
    </PagePanel>
    </WebSocketProvider>
  );
}
