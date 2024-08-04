// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import DashboardContext from "@/lib/models/dashboard_context";
import { HardwareConfiguration, NextAPIResponseInterface } from "@/lib/models/api_models";
import { DatabaseIOStateDocumentArray } from "@/lib/models/database_models"
import { R2Button } from "@/lib/components/client_components/click_button";

export default function DiagnosticsContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { dashboardContext: context } = useContext(DashboardContext);

  const get_IO_state_history = async () => {
    let res: NextAPIResponseInterface = await fetch(
      "api/backend/historian/io_data?number_of_points=5",
      {
        method: "GET",
        mode: "cors",
      }
    ).then((res) => res.json());
    console.log("GET response: " + JSON.stringify(res.data));

    let docs = new DatabaseIOStateDocumentArray(res.data.data);
    let i = 5;
  }

  const get_IO_configuration = async () => {
    let res: NextAPIResponseInterface = await fetch(
      "api/backend/ui/io_configuration",
      {
        method: "GET",
        mode: "cors",
      }
    ).then((res) => res.json());
    console.log("GET response: " + JSON.stringify(res.data));

    let config = new HardwareConfiguration(res.data.data);
    let i = 5;
  }
  
  const configure_point = async () => {
    let body = {
      index: 5,
      point_type: "ANALOG_INPUT",
    };
    let res: NextAPIResponseInterface = await fetch(
      "api/backend/configuration/io/configure_point",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(body),
      }
    ).then((res) => res.json());
    console.log("POST response: " + JSON.stringify(res.data));
  }

  const send_websocket_message = () => {
    if (context.ra_websocket != null) {
      context.ra_websocket.send("TEST MESSAGE");
    }
  }

  return (
    <DashboardHeaderContainer
      header_text={"DIAGNOSTICS"}
      icon_path={"/icons/sliders.svg"}
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {context.configuration?.configured ? (
        <div className={`grid grid-cols-1 p-2 h-full w-full justify-between${props.className ?? ""}`}>
          <R2Button
            text="GET IO STATE HISTORY"
            onClick={get_IO_state_history}
            // className="w-[55%]"
          />
          <R2Button
            text="GET IO CONFIGURATION"
            onClick={get_IO_configuration}
            // className="w-[55%]"
          />
          <R2Button
            text="CONFIURE IO POINT"
            onClick={configure_point}
            // className="w-[55%]"
          />
          <R2Button
            text="SEND WEBSOCKET MESSAGE"
            onClick={send_websocket_message}
            // className="w-[55%]"
          />
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
