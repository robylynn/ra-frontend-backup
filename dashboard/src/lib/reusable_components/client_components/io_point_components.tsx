// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Icon } from "@blueprintjs/core";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";

import { R2Button } from "@/lib/reusable_components/client_components/click_button";
import { IOPoint } from "@/lib/reusable_models/api_models";

const handleEntryBoxChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  point_index: number,
  state_setter: Dispatch<SetStateAction<number>>,
) => {
  state_setter(parseInt(event.target.value));
};

const handleIOPointClick = async (
  module_index: number,
  point_index: number,
  value: number | boolean,
) => {
  const query = new URLSearchParams({ value: value.toString() });
  const controller_response = await fetch(
    `/api/command/io/${module_index}/${point_index}?` + query,
    {
      method: "POST",
    },
  ).then((res) => res.json());

  console.log(controller_response);
};

export function IOPointControl(props: {
  point_index: number;
  point_state: boolean | number;
  children: ReactNode;
}) {
  return (
    <div
      key={props.point_index}
      className="grid items-center grid-cols-3 border rounded-sm"
    >
      <p className="py-0 m-0 text-left text-md">{`Channel ${props.point_index}`}</p>
      <div className="flex flex-row items-center justify-around w-full">
        {props.children}
      </div>
      <p className="text-right text-md">{`${props.point_state}`}</p>
    </div>
  );
}

export function AnalogOutputControl(props: {
  module_index: number;
  point: IOPoint;
  point_state: boolean | number;
}) {
  const [entryBoxState, setEntryBoxState] = useState<number>(0);

  return (
    <>
      <input
        className="w-[60%] m-0 rounded-sm"
        id={`${props.point.point_index}`}
        type="number"
        placeholder="Input"
        dir="auto"
        onChange={(event) =>
          handleEntryBoxChange(
            event,
            props.point.point_index,
            setEntryBoxState,
          )
        }
      />
      <R2Button
        className="w-[50%]"
        text={"Set"}
        onClick={() =>
          handleIOPointClick(
            props.module_index,
            props.point.point_index,
            entryBoxState,
          )
        }
      />
    </>
  );
}

// export function AnalogInputControl(props: {
//     module_index: number;
//     point: IOPoint;
//     point_state: boolean | number;
//   }) {
export function AnalogInputControl() {
  return <></>;
}

// export function DigitalInputControl() {
export function DigitalInputControl(props: {
  module_index: number;
  point: IOPoint;
  point_state: boolean | number;
}) {
  const indicator_light_color = (point_value: boolean): string => {
    return point_value ? "green" : "red";
  };

  return (
    <Icon
      icon={"full-circle"}
      size={20}
      color={indicator_light_color(props.point_state == 1)}
    />
  );
}

export function DigitalOutputControl(props: {
  module_index: number;
  point: IOPoint;
  point_state: boolean | number;
}) {
  return (
    <>
      <input
        type={"checkbox"}
        className="p-0 m-0"
        checked={props.point_state as boolean}
        onClick={() => {
          handleIOPointClick(
            props.module_index,
            props.point.point_index,
            !props.point_state,
          );
        }}
        onChange={() => {}}
      />
    </>
  );
}
