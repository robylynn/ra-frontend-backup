// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import DashboardContext from "@/lib/models/dashboard_context";
import { HardwareConfiguration, NextAPIResponseInterface } from "@/lib/models/api_models";
import { DatabaseIOStateDocumentArray } from "@/lib/models/database_models"
import { R2Button } from "@/lib/components/client_components/ClickButton";
import AnalogInDisplay from "@/lib/components/client_components/AnalogInDisplay";
import AnalogInputPlot from "@/lib/components/client_components/AnalogInputPlot";

export default function AnalogInputPlotContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext: context } = useContext(DashboardContext);

  return (
    <DashboardHeaderContainer
      header_text={"ANALOG INPUT PLOT"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {context.configuration?.configured ? (
        <AnalogInputPlot length={100}/>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
