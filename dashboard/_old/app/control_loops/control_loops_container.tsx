// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";

import {
  MaximalControlLoopControl,
  MinimalControlLoopControl,
} from "@/lib/reusable_components/server_components/control_loop_control";
import DashboardContext from "@/lib/models/dashboard_context";

import { DashboardHeaderContainer } from "../../src/lib/reusable_components/client_components/dashboard_header_container";
import LoadingIndicator from "../../src/lib/reusable_components/server_components/loading_indicator";

export function ControlLoopsContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { context } = useContext(DashboardContext);
  const [expansionState, setExpansionState] = useState<boolean>(false);

  const controls = (full: boolean): Array<ReactElement> => {
    const controls_array: Array<ReactElement> = [];

    if (!full) {
      for (const loop_name in context.latest_document.control_loops) {
        const loop = context.latest_document.control_loops[loop_name];
        controls_array.push(
          <MinimalControlLoopControl
            key={loop_name}
            loop_name={loop_name}
            enabled={loop.enabled}
            state_variables={loop.state_variables}
          />,
        );
      }
      return controls_array;
    } else {
      for (const loop_name in context.latest_document.control_loops) {
        const loop = context.latest_document.control_loops[loop_name];
        controls_array.push(
          <MaximalControlLoopControl
            key={loop_name}
            loop_name={loop_name}
            enabled={loop.enabled}
            parameters={loop.parameters}
            state_variables={loop.state_variables}
            expanded={expansionState || props.force_expanded ? true : false}
          />,
        );
      }
      return controls_array;
    }
  };

  return (
    <DashboardHeaderContainer
      header_text="CONTROL LOOPS"
      icon_path={"/icons/Loop.svg"}
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
      expansion_state={expansionState}
      set_expansion_state={setExpansionState}
    >
      {context == undefined || !context.latest_document.document_valid ? (
        <LoadingIndicator />
      ) : (
        <div className={`h-full bg-[#333944]`}>
          <div className="h-full">
            {controls(expansionState || props.force_expanded ? true : false)}
          </div>
        </div>
      )}
    </DashboardHeaderContainer>
  );
}
