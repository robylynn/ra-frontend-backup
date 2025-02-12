// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { Dispatch, SetStateAction, useContext } from "react";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import { AxisPositionContainer } from "@/lib/components/client_components/MotionPositionContainer";
import { NextAPIResponseInterface } from "@/lib/models/api_models";

export default function AxisPositionsPanel(props: {
    id: string;
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
  }) {
    const { dashboardContext } = useContext(DashboardContext);
    const save_configuration = async () => {
      const res: NextAPIResponseInterface = await fetch(
        "api/backend/ui/configuration",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify(dashboardContext.configuration),
        }
      ).then((res) => res.json());
      console.log("POST response: " + JSON.stringify(res.data));
    };
  
    return (
      <AxisPositionContainer />
    );
  }