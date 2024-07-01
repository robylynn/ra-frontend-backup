// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { ReactElement, useContext } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/reusable_components/client_components/dashboard_header_container";
import IOModuleControl from "@/lib/reusable_components/server_components/io_system_control";
import LoadingIndicator from "@/lib/reusable_components/server_components/loading_indicator";
import DashboardContext from "@/lib/reusable_models/dashboard_context";
import IOSystemControl from "@/lib/reusable_components/server_components/io_system_control";
import { NextAPIResponseInterface } from "@/lib/reusable_models/api_models";

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
              let res: NextAPIResponseInterface = await fetch("api/ros/streams/io_data?number_of_points=5", {
                method: "GET",
                mode: 'cors'
              }).then(res => res.json());
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
              let res: NextAPIResponseInterface = await fetch("api/ros/configuration/io/configure_point", {
                method: "POST",
                headers: {
                  'Accept': 'application/json',
                  "Content-Type": "application/json",
                },
                mode: 'cors',
                body: JSON.stringify(body)
              }).then(res => res.json());
              console.log("POST response: " + JSON.stringify(res.data))
            }}
          >
            POST BUTTON
          </button>
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
