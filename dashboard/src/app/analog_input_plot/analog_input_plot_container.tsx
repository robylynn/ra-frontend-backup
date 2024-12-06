// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import AnalogInputPlot from "@/lib/components/client_components/AnalogInputPlot";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";

export default function AnalogInputPlotContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext, setDashboardContext } = useContext(DashboardContext);

  return (
    <DashboardHeaderContainer
      header_text={"ANALOG INPUT PLOT"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {dashboardContext.configuration?.configured ? (
        <AnalogInputPlot length={100}/>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
