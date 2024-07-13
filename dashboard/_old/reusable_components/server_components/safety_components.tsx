// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { Icon } from "@blueprintjs/core";

import { R2ToggleButton } from "../client_components/click_button";

export function ParameterAlarmControl(props: {
  component_name: string;
  parameter_name: string;
  alarm_name: string;
  alarm_active: boolean;
  alarm_enabled: boolean;
  alarm_overridden: boolean;
}) {
  const indicator_color = props.alarm_active ? "red" : "grey";

  return (
    <div
      className="grid w-full grid-cols-4 my-1 border border-slate-500 place-items-center"
      key={props.alarm_name}
    >
      <span className="align-middle text-left w-[10%]">{props.alarm_name}</span>
      <Icon
        icon={"full-circle"}
        className=""
        size={25}
        color={indicator_color}
      />
      <R2ToggleButton
        text={"ENABLE"}
        onClick={() => {
          fetch(
            `/api/command/alarm/${props.component_name}/${props.parameter_name}`,
            {
              method: "POST",
              body: JSON.stringify({
                enable: !props.alarm_enabled,
              }),
            },
          );
        }}
        state={props.alarm_enabled}
        className="w-[100px]"
      />
      <R2ToggleButton
        text={"SILENCE"}
        onClick={() => {
          fetch(
            `/api/command/alarm/${props.component_name}/${props.parameter_name}`,
            {
              method: "POST",
              body: JSON.stringify({
                enable: !props.alarm_enabled,
              }),
            },
          );
        }}
        on_color={"red-300"}
        off_color={"slate-100"}
        state={props.alarm_overridden}
      />
    </div>
  );
}

export function MinimalParameterAlarmControl(props: {
  component_name: string;
  parameter_name: string;
  alarm_name: string;
  alarm_index: number;
  alarm_active: boolean;
  alarm_enabled: boolean;
  alarm_overridden: boolean;
}) {
  const indicator_color = props.alarm_active ? "red" : "grey";

  return (
    <div
      className="grid grid-cols-[20%_10%_35%_35%] border border-slate-500 rounded-lg mx-1 my-1 place-items-center"
      key={props.alarm_name}
    >
      <span className="text-left align-middle">{props.alarm_name}</span>
      <Icon
        icon={"full-circle"}
        className=""
        size={15}
        color={indicator_color}
      />
      <R2ToggleButton
        text={"ENABLE"}
        onClick={() => {
          fetch(
            `/api/command/alarm/${props.component_name}/${
              props.parameter_name
            }/${props.alarm_index}?enable=${!props.alarm_enabled}`,
            {
              method: "POST",
              body: JSON.stringify({
                enable: !props.alarm_enabled,
              }),
            },
          );
        }}
        state={props.alarm_enabled}
        className="w-[90px]"
      />
      <R2ToggleButton
        text={"SILENCE"}
        onClick={() => {
          fetch(
            `/api/command/alarm/${props.component_name}/${
              props.parameter_name
            }/${props.alarm_index}?override=${!props.alarm_overridden}`,
            {
              method: "POST",
              body: JSON.stringify({
                silence: !props.alarm_overridden,
              }),
            },
          );
        }}
        className="w-[90px]"
        state={props.alarm_overridden}
      />
    </div>
  );
}

export function ParameterInterlockControl(props: {
  component_name: string;
  parameter_name: string;
  interlock_name: string;
  interlock_active: boolean;
  interlock_enabled: boolean;
}) {
  const indicator_color = props.interlock_active ? "green" : "red";

  return (
    <div
      className="grid grid-cols-[20%_10%_70%] border border-slate-500 place-items-center rounded-lg my-1 mx-1 justify-content-center"
      key={props.interlock_name}
    >
      <p className="text-left align-middle">{props.interlock_name}</p>
      <Icon
        icon={"full-circle"}
        className=""
        size={25}
        color={indicator_color}
      />
      <R2ToggleButton
        text={"ENABLED"}
        onClick={() => {
          fetch(
            `/api/command/alarm/${props.component_name}/${props.parameter_name}`,
            {
              method: "POST",
              body: JSON.stringify({
                enable: !props.interlock_enabled,
              }),
            },
          );
        }}
        on_color={"green-300"}
        off_color={"red-300"}
        state={props.interlock_enabled}
      />
      <p>as;ldjkfh</p>
    </div>
  );
}

export function MinimalParameterInterlockControl(props: {
  component_name: string;
  parameter_name: string;
  interlock_name: string;
  interlock_index: number;
  interlock_active: boolean;
  interlock_enabled: boolean;
}) {
  const indicator_color = props.interlock_active ? "green" : "red";

  return (
    <div
      className="grid grid-cols-[20%_10%_70%] border border-slate-500 place-items-center rounded-lg my-1 mx-1"
      key={props.interlock_name}
    >
      <p className="p-0 m-0 text-left align-middle">{props.interlock_name}</p>
      <Icon
        icon={"full-circle"}
        className=""
        size={15}
        color={indicator_color}
      />
      <R2ToggleButton
        text={"ENABLED"}
        onClick={() => {
          fetch(
            `/api/command/interlock/${props.component_name}/${
              props.parameter_name
            }/${props.interlock_index}?enable=${!props.interlock_enabled}`,
            {
              method: "POST",
              body: JSON.stringify({
                enable: !props.interlock_enabled,
              }),
            },
          );
        }}
        on_color={"r2-green-300"}
        off_color={"r2-red-300"}
        state={props.interlock_enabled}
        className={"w-[90px]"}
      />
    </div>
  );
}
