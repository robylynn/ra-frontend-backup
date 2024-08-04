// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";
import { RosProvider } from "@/lib/ros/RosContext";
import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import { AnalogInputProvider } from "@/lib/components/client_components/AnalogInputContext";
import AnalogInputGroup from "@/lib/components/client_components/AnalogInputGroup";
import AnalogInDisplay from "@/lib/components/client_components/AnalogInDisplay";

export default function ROSContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  return (
    // <RosProvider>
    <DashboardHeaderContainer
      header_text={"ROS CONFIGURATION"}
      icon_path={"/icons/sliders.svg"}
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      <AnalogInputProvider>
        {/* <div style={{ display: "flex" }}> */}
        <div className="flex">
          <AnalogInputGroup />
          {/* <AnalogInputPlot /> */}
        </div>
      </AnalogInputProvider>
    </DashboardHeaderContainer>
    // </RosProvider>
  );
}
