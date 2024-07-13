// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Dispatch, SetStateAction, useContext, useState } from "react";

import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import { StringInputControl } from "@/lib/reusable_components/client_components/system_setup_components";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import DashboardContext from "@/lib/models/dashboard_context";

export function SetupContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { context } = useContext(DashboardContext);
  const [expansionState, setExpansionState] = useState<boolean>(false);

  const text_size = (expansionState || props.force_expanded ? true : false)
    ? "text-md"
    : "text-xs";

  return (
    <DashboardHeaderContainer
      header_text="SETUP"
      icon_path={"/icons/Control.svg"}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
      expansion_state={expansionState}
      set_expansion_state={setExpansionState}
      className={`${props.className ?? ""}`}
    >
      {context == undefined || !context.latest_document.document_valid ? (
        <LoadingIndicator />
      ) : (
        <div
          className={`flex flex-col px-2 h-full justify-around ${text_size}`}
        >
          <StringInputControl
            parameter_name="plan_id"
            parameter_state={context.latest_document.plan_id ?? "UNAVAILABLE"}
          />
          <StringInputControl
            parameter_name="experiment_id"
            parameter_state={
              context.latest_document.experiment_id ?? "UNAVAILABLE"
            }
          />
          <StringInputControl
            parameter_name="operator_note"
            parameter_state="UNAVAILABLE"
          />
        </div>
      )}
    </DashboardHeaderContainer>
  );
}
