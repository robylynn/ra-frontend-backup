// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import MotionPlot from '@/lib/components/client_components/MotionPlot';
// import IOPointGroup from "@/lib/components/client_components/IOPointGroup";
// import { IOPointType } from "@/lib/models/api_models";

export default function MotionPlotContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext } = useContext(DashboardContext);

  return (
    <DashboardHeaderContainer
      header_text={"MOTION PLOT"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {dashboardContext.configuration?.configured ? (
        <>
        <MotionPlot
          title={"Axis Velocities"}
          data_key="velocity"
          unit="rev/s"
          axes={[0, 1]}
          y_axis_transformation={(v) => v + 10}
        />
        <MotionPlot
          title={"Axis Positions"}
          data_key="position"
          unit="rev"
          axes={[0, 1]}
          y_axis_transformation={(v) => v + 5}
        />
        </>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
