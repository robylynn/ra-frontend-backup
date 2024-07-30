// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";
import { RosProvider } from "@/lib/ros/RosContext";
import { AnalogInputProvider } from "@/lib/components/client_components/AnalogInputContext";
import AnalogInputGroup from "@/lib/components/client_components/AnalogInputGroup";

export default function ROSContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  return (
    // <RosProvider>
    <AnalogInputProvider>
      {/* <div style={{ display: "flex" }}> */}
      <div className="flex">
        <AnalogInputGroup />
        {/* <AnalogInputPlot /> */}
      </div>
    </AnalogInputProvider>
    // </RosProvider>
  );
}
