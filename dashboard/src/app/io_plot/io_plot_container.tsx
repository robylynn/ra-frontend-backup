// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
// import AnalogInputPlot from "@/lib/components/client_components/AnalogInputPlot";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import IOPlot from "@/lib/components/client_components/IOPlot";
import { IOPointType } from "@/lib/models/api_models";

export default function IOPlotContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext, setDashboardContext } = useContext(DashboardContext);

  return (
    <DashboardHeaderContainer
      header_text={"IO PLOT"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {dashboardContext.configuration?.configured ? (
        <>
        <IOPlot length={100} point_type={IOPointType.ANALOG_INPUT} point_channels={[0, 1]}/>
        <IOPlot length={100} point_type={IOPointType.DIGITAL_INPUT} point_channels={[0, 1]}/>
        </>
        //<AnalogInputPlot length={100}/
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
