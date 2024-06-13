// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import "@blueprintjs/core/lib/css/blueprint.css";
import { Dispatch, SetStateAction, useContext, useState } from "react";

import BooleanComponentControlContainer from "@/lib/reusable_components/client_components/boolean_component_control_container";
import { R2Button } from "@/lib/reusable_components/client_components/click_button";
import ComponentControlContainer from "@/lib/reusable_components/client_components/component_control_container";
import LoadingIndicator from "@/lib/reusable_components/server_components/loading_indicator";
import DashboardContext from "@/lib/reusable_models/dashboard_context";

import { DashboardHeaderContainer } from "../../lib/reusable_components/client_components/dashboard_header_container";
import { ControlsSubContainer } from "../../lib/reusable_components/server_components/controls_sub_container";

export default function ControlContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const [expansionState, setExpansionState] = useState<boolean>(false);
  const { context } = useContext(DashboardContext);

  const text_size =
    expansionState || props.force_expanded ? "text-md" : "text-xs";

  const send_state_command = async (state_command: string) => {
    const response = await fetch("/api/command/state", {
      method: "POST",
      body: JSON.stringify({
        state: state_command,
      }),
    }).then((res) => res.json());

    console.log(response);
  };

  return (
    <DashboardHeaderContainer
      header_text="CONTROL"
      icon_path="/icons/Control.svg"
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
      expansion_state={expansionState}
      set_expansion_state={setExpansionState}
    >
      {context.latest_document.document_valid ? (
        <div className={`flex flex-col h-full`}>
          <div className="grid content-center grid-cols-3 my-1 justify-items-center">
            <R2Button
              text="AUTO"
              onClick={() => send_state_command("AUTOMATIC")}
              className="w-[64px] p-1 rounded-[11px] text-white border-r2-green-300/[.62]"
            />
            <R2Button
              text="MANUAL"
              onClick={() => send_state_command("MANUAL")}
              className="w-[80px] p-1 rounded-[11px] text-white border-[#FFEE52]/[.49]"
            />
            <R2Button
              text="STOP"
              onClick={() => send_state_command("STOP")}
              className="w-[64px] p-1 rounded-[11px] text-white border-[#FF6C6C]/[.51]"
            />
          </div>
          <div className={`grid grid-cols-[45%_55%] gap-y-2 ${text_size}`}>
            <p className="mx-2 mt-2 mb-0 text-left dark:text-r2-dark-text-color">
              Main System
            </p>
            <p className="mx-2 mt-2 mb-0 text-left dark:text-r2-dark-text-color">
              Conveying System
            </p>
            <ControlsSubContainer title="PROCESS EQUIPMENT">
              <ComponentControlContainer
                card_title={"Inlet Fan"}
                units={"rpm"}
                slider_maximum={3545}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={1000}
                component_name={"low_temp_fan"}
                component_button_text={"Inlet Fan"}
                parameter={"frequency"}
              />
              <ComponentControlContainer
                card_title={"Outlet Fan"}
                units={"rpm"}
                slider_maximum={3555}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={1000}
                component_name={"high_temp_fan"}
                component_button_text={"Outlet Fan"}
                parameter={"frequency"}
              />
              <ComponentControlContainer
                card_title={"Electric Preheater"}
                units={"NA"}
                slider_maximum={520}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={100}
                component_name={"carbonator_preheater"}
                component_button_text={"Preheater"}
                parameter={"power"}
              />
              <ComponentControlContainer
                card_title={"Control Valve"}
                units={"NA"}
                slider_maximum={100}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={20}
                component_name={"inlet_control_valve"}
                component_button_text={"Control Valve"}
                stop_text={"Close"}
                parameter={"position"}
              />
            </ControlsSubContainer>
            <ControlsSubContainer title="BLOWER SIDE">
              <ComponentControlContainer
                card_title={"Conveying Blower"}
                units={"rpm"}
                slider_maximum={3000}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={1000}
                component_name={"conveying_blower"}
                component_button_text={"Blower"}
                parameter={"frequency"}
              />
              <BooleanComponentControlContainer
                title="Blow Tank Gate Valve"
                pid_tag="GAV03"
                component_name="blow_tank_gate_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
              <BooleanComponentControlContainer
                title="Blow Tank Dome Valve"
                pid_tag="DV01"
                component_name="blow_tank_dome_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
              <BooleanComponentControlContainer
                title="Pneumatic Vibrator"
                pid_tag="PV01"
                component_name="blow_tank_pneumatic_hammer"
                parameter="active"
                true_text="ON"
                false_text="OFF"
              />
              <BooleanComponentControlContainer
                title="Conveying Air Bypass Valve"
                pid_tag="PV02"
                component_name="conveying_air_bypass_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
            </ControlsSubContainer>

            <ControlsSubContainer title="CARBONATOR">
              <ComponentControlContainer
                card_title={"Outlet Valve"}
                units={"rpm"}
                slider_maximum={1500}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={500}
                component_name={"outlet_rotary_valve"}
                component_button_text={"Rotary Valve"}
                parameter={"frequency"}
              />
              <BooleanComponentControlContainer
                title="Pneumatic Hammer"
                component_name="carbonator_pneumatic_hammer"
                parameter="active"
                true_text="ON"
                false_text="OFF"
              />
            </ControlsSubContainer>
            <ControlsSubContainer title="RECEIVER SIDE">
              <BooleanComponentControlContainer
                title="Receiving Tank Dome Valve"
                pid_tag="DV02"
                component_name="receiving_tank_dome_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
              <BooleanComponentControlContainer
                title="Receiving Tank Gate Valve"
                pid_tag="GAV01"
                component_name="receiving_tank_gate_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
              <BooleanComponentControlContainer
                title="Cyclone Dome Valve"
                pid_tag="DV03"
                component_name="cyclone_dome_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
              <BooleanComponentControlContainer
                title="Cyclone Gate Valve"
                pid_tag="GAV02"
                component_name="cyclone_gate_valve"
                parameter="active"
                true_text="OPEN"
                false_text="CLOSE"
              />
              <ComponentControlContainer
                card_title={"Cyclone Rotary Valve"}
                units={"rpm"}
                slider_maximum={1500}
                slider_minimum={0}
                slider_step_size={1}
                slider_label_step_size={250}
                component_name={"cyclone_rotary_valve"}
                component_button_text={"Rotary Valve"}
                parameter={"frequency"}
              />
            </ControlsSubContainer>
          </div>
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
