// Frontend Web Application for RA Products
// Developed by R2 Labs

// "use client";

import { Dispatch, SetStateAction } from "react";
import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import AnalogInputGroup from "@/lib/components/client_components/AnalogInputGroup";
import DigitalInputGroup from "@/lib/components/client_components/DigitalInputGroup";

export default function ROSContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  return (
    <DashboardHeaderContainer
      header_text={"ROS CONFIGURATION"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
        <div className="flex flex-col">
          <AnalogInputGroup />
          <DigitalInputGroup />
        </div>
    </DashboardHeaderContainer>
  );
}
