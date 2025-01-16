// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { Dispatch, SetStateAction, useContext } from "react";

import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import { MotionPlotContainer } from "@/lib/components/client_components/MotionPlotContainer";
import { NextAPIResponseInterface } from "@/lib/models/api_models";

export default function MotionPlotPanel(props: {
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
    <DashboardHeaderContainer
      header_text={"MOTION PLOT"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
      button_text="Save Configuration"
      button_callback={() => {
        save_configuration();
      }}
    >
      <MotionPlotContainer />
    </DashboardHeaderContainer>
  );
}
