// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, Dispatch, SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import DashboardContext from "@/lib/models/dashboard_context";
import { NextAPIResponseInterface } from "@/lib/models/api_models";

export default function DiagnosticsContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { context } = useContext(DashboardContext);

  return (
    <DashboardHeaderContainer
      header_text={"DIAGNOSTICS"}
      icon_path={"/icons/sliders.svg"}
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {context.configuration?.configured ? (
        <div className={`grid grid-cols-1 p-2 ${props.className ?? ""}`}>
          <button
            className="w-[25%] bg-white"
            onClick={async () => {
              let res: NextAPIResponseInterface = await fetch(
                "api/ros/streams/io_data?number_of_points=5",
                {
                  method: "GET",
                  mode: "cors",
                }
              ).then((res) => res.json());
              console.log("GET response: " + JSON.stringify(res.data));
            }}
          >
            GET BUTTON
          </button>
          <button
            className="w-[25%] bg-white"
            onClick={async () => {
              let body = {
                index: 5,
                point_type: "ANALOG_INPUT",
              };
              let res: NextAPIResponseInterface = await fetch(
                "api/ros/configuration/io/configure_point",
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
            }}
          >
            POST BUTTON
          </button>
          <button
            className="w-[25%] bg-white"
            onClick={() => {
              if (context.ra_websocket != null) {
                context.ra_websocket.send("TEST MESSAGE");
              }
            }}
          >
            WEBSOCKET SEND BUTTON
          </button>
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
