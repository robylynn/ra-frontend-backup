// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { useState } from "react";

import { R2Button } from "@/lib/components/client_components/click_button";

export function StringInputControl(props: {
  parameter_name: string;
  parameter_state: string;
}) {
  const [entryBoxState, setEntryBoxState] = useState<string>("");

  const handleSetParameterClick = async (value: string) => {
    const query = new URLSearchParams({ value: value });
    const controller_response = await fetch(
      `api/command/operations/${props.parameter_name}?` + query,
      {
        method: "POST",
        body: JSON.stringify({
          value: value == "" ? null : value,
        }),
      },
    ).then((res) => res.json());

    console.log(controller_response);
  };

  return (
    <div
      className="grid items-center grid-cols-2 space-x-6"
      key={props.parameter_name}
    >
      <div className="flex flex-col items-center text-left">
        <p className="w-full p-0 m-0 font-bold text-r2-white">
          {props.parameter_name}
        </p>
        <p className="p-0 m-0 text-center text-r2-gray-300">
          {props.parameter_state}
        </p>
      </div>
      <div className="grid grid-cols-2 justify-items-end">
        <input
          className="border rounded-sm w-[100%]"
          type="text"
          step={0.1}
          min={0}
          placeholder="Input"
          dir="auto"
          onChange={(event) =>
            setEntryBoxState(() => {
              return event.target.value;
            })
          }
        />
        <R2Button
          text={"Set"}
          onClick={() => handleSetParameterClick(entryBoxState)}
          className="p-1 dark:bg-r2-white/[.61] dark:hover:bg-slate-300"
        />
      </div>
    </div>
  );
}
