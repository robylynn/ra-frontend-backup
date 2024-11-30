// Frontend Web Application for RA Products
// Developed by R2 Labs

// "use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
// import MotionPlot from '@/lib/components/client_components/MotionPlot';
import { MotionPlotContainer } from "@/lib/components/client_components/MotionPlotContainer";
// import SimpleMotionPlot from "@/lib/components/client_components/SimpleMotionPlot";
// import IOPointGroup from "@/lib/components/client_components/IOPointGroup";
// import { IOPointType } from "@/lib/models/api_models";
import { NextAPIResponseInterface } from "@/lib/models/api_models";

export default function MotionPlotPanel(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext } = useContext(DashboardContext);
  const save_configuration = async () => {
    let res: NextAPIResponseInterface = await fetch(
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
      {/* <MotionPlotContainer/> */}
      {/* <SimpleMotionPlot/> */}
      <MotionPlotContainer />
      {/* <SimpleMotionPlot
          title={"Axis Velocities"}
          data_key="velocity"
          unit="rev/s"
          axes={[0, 1]}
          length={100}
          y_axis_transformation={(v) => v + 10}
        /> */}
      {/* {dashboardContext.configuration?.configured ? (
        <>
        <MotionPlot
          title={"Axis Velocities"}
          data_key="velocity"
          unit="rev/s"
          axes={[0, 1]}
          length={100}
          y_axis_transformation={(v) => v + 10}
        />
        <MotionPlot
          title={"Axis Positions"}
          data_key="position"
          unit="rev"
          axes={[0, 1]}
          length={100}
          y_axis_transformation={(v) => v + 5}
        />
        </>
      ) : (
        <LoadingIndicator />
      )} */}
    </DashboardHeaderContainer>
  );
}
