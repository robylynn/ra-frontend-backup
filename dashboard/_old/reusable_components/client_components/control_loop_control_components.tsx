// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { useState } from "react";

import { R2Button, R2ToggleButton } from "./click_button";

export function NumericInputControl(props: {
  loop_name: string;
  parameter_name: string;
  parameter_state: number;
  expanded: boolean;
}) {
  const [entryBoxState, setEntryBoxState] = useState<number>(0);
  const text_size = props.expanded ? "text-md" : "text-xs";

  const handleSetParameterClick = async (value: number) => {
    fetch(`/command/loop/${props.loop_name}/${props.parameter_name}`, {
      method: "POST",
      body: JSON.stringify({
        value: value,
      }),
    });
  };

  return (
    <div
      className="grid items-center w-full grid-cols-3 px-2 space-x-6"
      key={props.parameter_name}
    >
      <p className={`dark:text-r2-white ${text_size}`}>
        {props.parameter_name}
      </p>
      <div className="flex flex-row items-center justify-center space-x-2">
        <input
          className="border rounded-sm"
          type="number"
          step={0.1}
          min={0}
          placeholder="Input"
          dir="auto"
          onChange={(event) =>
            // setEntryBoxState((state) => {
            //     return parseFloat(event.target.value);
            // })
            setEntryBoxState(() => {
              return parseFloat(event.target.value);
            })
          }
        />
        <R2Button
          text={"Set"}
          onClick={() => handleSetParameterClick(entryBoxState)}
        />
      </div>
      <p className={`text-right dark:text-r2-white ${text_size}`}>
        {props.parameter_state}
      </p>
    </div>
  );
}

export function BooleanInputControl(props: {
  loop_name: string;
  parameter_name: string;
  parameter_state: boolean;
  className?: string;
}) {
  const handleSetSwitchClick = async (value: boolean) => {
    await fetch(
      `/api/command/control_loops/${props.loop_name}/${props.parameter_name}`,
      {
        method: "POST",
        body: JSON.stringify({
          value: value,
        }),
      },
    );
  };

  return (
    <div className="place-items-center" key={props.parameter_name}>
      <R2ToggleButton
        text={props.parameter_name.toUpperCase()}
        state={props.parameter_state}
        onClick={() => {
          handleSetSwitchClick(!props.parameter_state);
        }}
        className={`p-2 w-full ${props.className ?? ""}`}
      />
    </div>
  );
}
