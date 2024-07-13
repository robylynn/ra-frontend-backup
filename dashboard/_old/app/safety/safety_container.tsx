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

import { DashboardHeaderContainer } from "@/lib/components/client_components/dashboard_header_container";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import {
  MinimalParameterAlarmControl,
  MinimalParameterInterlockControl,
} from "@/lib/reusable_components/server_components/safety_components";
import DashboardContext from "@/lib/models/dashboard_context";

export function SafetyContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { context } = useContext(DashboardContext);
  const [expansionState, setExpansionState] = useState<boolean>(false);

  const text_size =
    expansionState || props.force_expanded ? "text-md" : "text-xs";

  let parameter_alarm_control_array: Array<ReactElement> = [];
  let parameter_interlock_control_array: Array<ReactElement> = [];
  const controls_array: Array<ReactElement> = [];

  for (const component_name of context.latest_document.hardware_components) {
    const parameters =
      context.latest_document.GetComponentParameters(component_name);
    if (parameters == undefined) continue;

    const safety_parameter_controls: Array<ReactElement> = [];
    for (const parameter_name of Object.keys(parameters)) {
      const parameter = parameters[parameter_name];

      parameter_interlock_control_array = parameter.interlocks.map(
        (interlock, interlock_index) => {
          const interlock_name = `interlock_${interlock_index}`;
          return (
            <MinimalParameterInterlockControl
              key={interlock_name}
              component_name={component_name}
              parameter_name={parameter_name}
              interlock_name={interlock_name}
              interlock_index={interlock_index}
              interlock_active={interlock.armed}
              interlock_enabled={interlock.enabled}
            />
          );
        },
      );

      parameter_alarm_control_array = parameter.alarms.map(
        (alarm, alarm_index) => {
          const alarm_name = `alarm_${alarm_index}`;
          return (
            <MinimalParameterAlarmControl
              key={alarm_name}
              component_name={component_name}
              parameter_name={parameter_name}
              alarm_name={alarm_name}
              alarm_index={alarm_index}
              alarm_active={alarm.active}
              alarm_enabled={alarm.enabled}
              alarm_overridden={alarm.overridden}
            />
          );
        },
      );

      if (
        parameter_interlock_control_array.length > 0 ||
        parameter_alarm_control_array.length > 0
      ) {
        safety_parameter_controls.push(
          <div
            key={parameter_name}
            className="flex flex-col border border-purple-400 rounded-xl my-2 mx-0.5 align-items-center"
          >
            <div className="place-items-center content-center justify-around h-full w-[25%]">
              <p className="w-full h-full p-1 m-0 font-bold text-left align-middle">
                {parameter_name}
              </p>
            </div>
            <div className="flex flex-col justify-end w-full">
              {parameter_alarm_control_array}
              {parameter_interlock_control_array}
            </div>
          </div>,
        );
      }
    }

    if (safety_parameter_controls.length > 0) {
      controls_array.push(
        <div
          className="p-1 mx-1 mb-2 dark:bg-r2-dark-background-500 rounded-xl"
          key={component_name}
        >
          <p className="font-bold">{component_name.toUpperCase()}</p>
          {safety_parameter_controls}
        </div>,
      );
    }
  }

  return (
    <DashboardHeaderContainer
      header_text="SAFETY"
      icon_path="/icons/alert-circle.svg"
      className={`${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
      expansion_state={expansionState}
      set_expansion_state={setExpansionState}
    >
      {context.latest_document.document_valid ? (
        <div className="flex flex-col h-full mb-2 rounded-xl dark:bg-r2-dark-background-400">
          <p className="p-2 m-0 dark:text-r2-dark-text-color">
            Alarms & Interlocks
          </p>
          <div className={`m-1 dark:text-r2-white rounded-xl ${text_size}`}>
            {parameter_alarm_control_array}
            {controls_array}
          </div>
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
