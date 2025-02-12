// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import {
  ROSIOStateInterface,
  DatabaseROSIOStateArray,
} from "@/lib/models/database_models";
import { R2Button } from "@/lib/components/client_components/ClickButton";
import {
  IOPointType,
  IOPointTypeFriendlyName,
  PlotConfiguration,
} from "@/lib/models/api_models";


// TODO: jogging buttons, axis jog speed, axis jog distance, axis jog direction
// TODO: add button to R2 buttons
interface JogAxisProps {
  axis: string;
}

const JogAxis: React.FC<JogAxisProps> = ({ axis }) => {
  return (
    <div className="flex w-full grid grid-cols-3 items-center justify-center p-4">
      <R2Button text="Jog - " onClick={() => {}} />
      <div className="flex flex-col items-center justify-center">
        <h2> Jog Axis {axis}</h2>
      </div>
      <R2Button text="Jog +" onClick={() => {}} />
    </div>
  );
}

const JogPanel = () => {
  return (
    <div className="flex grid grid-col-1 w-full items-center jutiify-center p-4">
      <div className="flex flex-col items-center justify-center">
        <JogAxis axis="0" />
        </div>    
      <div className="flex flex-col items-center justify-center">
        <JogAxis axis="1" />
        </div>
      <div className="flex flex-col items-center justify-center">
        <JogAxis axis="2" />
        </div>
      <div className="flex flex-col items-center justify-center">
        <JogAxis axis="3" />
        </div>
    </div>
  );
}


const JogContainer = () => {
  const { dashboardContext } = useContext(DashboardContext);

  return (
    <JogPanel />
  );
};

export default JogContainer;
