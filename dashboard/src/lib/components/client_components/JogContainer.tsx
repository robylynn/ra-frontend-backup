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


const JogContainer = () => {
  const { dashboardContext } = useContext(DashboardContext);

  return (
    <p> Jog Container</p>
  );
};

export default JogContainer;
