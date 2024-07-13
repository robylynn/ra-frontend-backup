// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import React, { ReactElement } from "react";

import {
  BooleanInputControl,
  NumericInputControl,
} from "@/lib/reusable_components/client_components/control_loop_control_components";

export function ControlLoopControl(props: {
  loop_name: string;
  enabled: boolean;
  parameters: Record<string, number | boolean>;
  state_variables: Record<string, number | boolean | string>;
}) {
  const parameter_controls = () => {
    const parameter_controls: Array<ReactElement> = [];
    for (const parameter_name in props.parameters) {
      const parameter_state = props.parameters[parameter_name];
      parameter_controls.push(
        typeof parameter_state == "number" ? (
          <NumericInputControl
            loop_name={props.loop_name}
            parameter_name={parameter_name}
            parameter_state={parameter_state}
            expanded={false}
          />
        ) : typeof parameter_state == "boolean" ? (
          <BooleanInputControl
            loop_name={props.loop_name}
            parameter_name={parameter_name}
            parameter_state={parameter_state}
          />
        ) : (
          <></>
        ),
      );
    }
    return parameter_controls;
  };

  const state_variables = () => {
    const state_variables: Array<ReactElement> = [];
    const state_variable_names: Array<ReactElement> = [];
    for (const state_variable_name in props.state_variables) {
      const state_variable = props.state_variables[state_variable_name];
      state_variable_names.push(
        <p key={state_variable_name} className="text-xs">
          {state_variable_name}
        </p>,
      );
      state_variables.push(
        <p key={state_variable_name} className="text-xs truncate">
          {state_variable.toString()}
        </p>,
      );
    }
    return (
      <div className="flex flex-col w-full border rounded-lg border-slate-500">
        <p className="w-full text-center">STATE VARIABLES</p>
        <div className="flex flex-row justify-between w-full p-2">
          <div>{state_variable_names}</div>
          <div className="text-center w-[65%]">{state_variables}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <div className="border-2 border-slate-700 bg-slate-100 rounded-lg my-2 mx-0.5">
        <p className="font-bold text-center">{props.loop_name}</p>
        <div className="flex flex-row place-content-stretch gap-x-2">
          <div className="p-2 border rounded-lg place-items-center gap-y-1 border-slate-500">
            <p className="text-center">PARAMETERS</p>
            <div className="py-2">
              <BooleanInputControl
                loop_name={props.loop_name}
                parameter_name={"enable"}
                parameter_state={props.enabled}
              />
            </div>
            <div className="grid grid-flow-row auto-cols-max">
              {parameter_controls()}
            </div>
          </div>
          {state_variables()}
        </div>
      </div>
    </div>
  );
}

export function MaximalControlLoopControl(props: {
  loop_name: string;
  enabled: boolean;
  parameters: Record<string, number | boolean>;
  state_variables: Record<string, number | boolean | string>;
  expanded: boolean;
}) {
  const text_size = props.expanded ? "text-md" : "text-xs";

  const numeric_parameter_controls = () => {
    const parameter_controls: Array<ReactElement> = [];
    for (const parameter_name in props.parameters) {
      const parameter_state = props.parameters[parameter_name];
      if (typeof parameter_state == "number") {
        parameter_controls.push(
          <NumericInputControl
            loop_name={props.loop_name}
            parameter_name={parameter_name}
            parameter_state={parameter_state}
            expanded={props.expanded}
          />,
        );
      }
    }
    return (
      <div className="flex flex-col w-full p-1 space-y-2 rounded-lg dark:bg-r2-dark-background-500">
        {parameter_controls}
      </div>
    );
  };

  const boolean_parameter_controls = () => {
    const parameter_controls: Array<ReactElement> = [];
    for (const parameter_name in props.parameters) {
      const parameter_state = props.parameters[parameter_name];
      if (typeof parameter_state == "boolean") {
        parameter_controls.push(
          <BooleanInputControl
            loop_name={props.loop_name}
            parameter_name={parameter_name}
            parameter_state={parameter_state}
          />,
        );
      }
    }
    return (
      <div className="flex flex-col w-full p-1 px-2 space-y-2 rounded-lg dark:bg-r2-dark-background-500">
        {parameter_controls}
      </div>
    );
  };

  const state_variables = () => {
    const state_variables: Array<ReactElement> = [];
    const state_variable_names: Array<ReactElement> = [];
    for (const state_variable_name in props.state_variables) {
      const state_variable = props.state_variables[state_variable_name];
      state_variable_names.push(
        <p key={state_variable_name} className={`${text_size}`}>
          {state_variable_name}
        </p>,
      );
      state_variables.push(
        <p key={state_variable_name} className={`truncate ${text_size}`}>
          {state_variable.toString()}
        </p>,
      );
    }

    return (
      <div className="flex flex-col w-full p-1 rounded-lg dark:bg-r2-dark-background-500">
        <div className="flex flex-row justify-between w-full px-2 text-r2-white">
          <div>{state_variable_names}</div>
          <div className="w-full text-right bg-transparent">
            {state_variables}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-2 m-2 border rounded-xl">
      <div className="flex flex-row items-center justify-between w-full p-2">
        <p className="p-0 m-0 text-sm font-bold truncate dark:text-r2-white">
          {props.loop_name.toUpperCase()}
        </p>
        <BooleanInputControl
          loop_name={props.loop_name}
          parameter_name={"enable"}
          parameter_state={props.enabled}
          className="dark:bg-r2-white/[.61] dark:hover:bg-slate-300"
        />
      </div>
      <div className="flex flex-col w-full space-y-2">
        {state_variables()}
        {numeric_parameter_controls()}
        {boolean_parameter_controls()}
      </div>
    </div>
  );
}

export function MinimalControlLoopControl(props: {
  loop_name: string;
  enabled: boolean;
  state_variables: Record<string, number | boolean | string>;
}) {
  const state_variables = () => {
    const state_variables: Array<ReactElement> = [];
    const state_variable_names: Array<ReactElement> = [];
    for (const state_variable_name in props.state_variables) {
      const state_variable = props.state_variables[state_variable_name];
      state_variable_names.push(
        <p key={state_variable_name} className="text-xs">
          {state_variable_name}
        </p>,
      );
      state_variables.push(
        <p key={state_variable_name} className="text-xs truncate">
          {state_variable.toString()}
        </p>,
      );
    }

    return (
      <div className="flex flex-col w-full p-1 rounded-lg dark:bg-r2-dark-background-500">
        <div className="flex flex-row justify-between w-full px-2 text-white">
          <div>{state_variable_names}</div>
          <div className="w-full text-right bg-transparent">
            {state_variables}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-2 m-2 border rounded-xl">
      <div className="flex flex-row items-center justify-between w-full p-2">
        <p className="p-0 m-0 text-sm font-bold truncate dark:text-r2-white">
          {props.loop_name.toUpperCase()}
        </p>
        <BooleanInputControl
          loop_name={props.loop_name}
          parameter_name={"enable"}
          parameter_state={props.enabled}
          className="dark:bg-r2-white/[.61] dark:hover:bg-slate-300"
        />
      </div>
      {state_variables()}
    </div>
  );
}
