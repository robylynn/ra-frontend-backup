// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import DashboardContext from "@/lib/models/dashboard_context";
import VelocityPlot from '@/lib/components/client_components/MotionPlot';

export default function MotionPlotContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext: context } = useContext(DashboardContext);

  return (
    <DashboardHeaderContainer
      header_text={"MOTION PLOT"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {context.configuration?.configured ? (
        <VelocityPlot/>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
