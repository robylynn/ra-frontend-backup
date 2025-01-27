// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { Dispatch, SetStateAction, useContext } from "react";

// import { R2Button } from "@/lib/components/client_components/ClickButton";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import IODisplay from "@/lib/components/client_components/IODisplay";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
// import { HardwareConfiguration, NextAPIResponseInterface } from "@/lib/models/api_models";
// import { DatabaseIOStateDocumentArray } from "@/lib/models/database_models"

export default function IOStateContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext } = useContext(DashboardContext);

  // const get_IO_state_history = async () => {
  //   let res: NextAPIResponseInterface = await fetch(
  //     "api/backend/historian/io_data?number_of_points=5",
  //     {
  //       method: "GET",
  //       mode: "cors",
  //     }
  //   ).then((res) => res.json());
  //   console.log("GET response: " + JSON.stringify(res.data));

  //   let docs = new DatabaseIOStateDocumentArray(res.data.data);
  //   let i = 5;
  // }

  // const get_IO_configuration = async () => {
  //   let res: NextAPIResponseInterface = await fetch(
  //     "api/backend/ui/io_configuration",
  //     {
  //       method: "GET",
  //       mode: "cors",
  //     }
  //   ).then((res) => res.json());
  //   console.log("GET response: " + JSON.stringify(res.data));

  //   let config = new HardwareConfiguration(res.data.data);
  //   let i = 5;
  // }

  return (
    <DashboardHeaderContainer
      header_text={"IO STATE"}
      icon_path={"/icons/sliders.svg"}
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {dashboardContext.configuration?.configured ? (
        <IODisplay/>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
