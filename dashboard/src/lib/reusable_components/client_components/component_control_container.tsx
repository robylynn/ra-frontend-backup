// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { useContext, useState } from "react";

import { R2Button } from "./click_button";
import DashboardContext from "../../reusable_models/dashboard_context";
import AnalogControlSlider from "../server_components/analolg_control_slider";

interface ComponentOperationsContainerProps {
  card_title: string;
  units: string | undefined;
  slider_maximum: number;
  slider_minimum: number;
  slider_step_size: number;
  slider_label_step_size: number;
  component_name: string;
  component_button_text: string;
  parameter: string;
  set_text?: string;
  stop_text?: string;
}

export default function ComponentControlContainer(
  props: ComponentOperationsContainerProps,
) {
  const { context } = useContext(DashboardContext);
  const [sliderState, setSliderState] = useState<number>(0);

  const parameter_units = context.configuration.GetComponentParameterUnits(
    props.component_name,
    props.parameter,
  );

  const parameter_state = context.latest_document.GetComponentParameterState(
    props.component_name,
    props.parameter,
  ) as number;

  const post_command = async (value: number) => {
    const query = new URLSearchParams({ value: value.toString() });
    const response = await fetch(
      `/api/command/component/${props.component_name}/${props.parameter}?` +
        query,
      {
        method: "POST",
      },
    ).then((res) => res.json());

    console.log(response);
  };

  return (
    <div className="flex flex-col p-2 mx-2 my-2 border rounded shadow-md border-r2-purple-500 dark:bg-r2-dark-background-400 dark:text-r2-white">
      <div className="flex flex-row justify-between w-full">
        <div>{props.card_title + ` (${parameter_units})`}</div>
        <div>{parameter_state?.toFixed(1)}</div>
      </div>

      <AnalogControlSlider
        sliderState={sliderState}
        setSliderState={setSliderState}
        minimum={props.slider_minimum}
        maximum={props.slider_maximum}
        stepSize={props.slider_step_size}
        labelStepSize={props.slider_label_step_size}
      />
      <div className="grid w-full grid-cols-2 gap-x-2">
        <R2Button
          text={`${props.set_text ?? "Set"} ${props.component_button_text}`}
          onClick={() => post_command(sliderState)}
          className="w-full"
        />
        <R2Button
          text={`${props.stop_text ?? "Stop"} ${props.component_button_text}`}
          onClick={() => post_command(0)}
          className="w-full"
        />
      </div>
    </div>
  );
}
