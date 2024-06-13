// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { Slider } from "@blueprintjs/core";

export default function AnalogControlSlider(props: {
  sliderState: number;
  setSliderState: React.Dispatch<React.SetStateAction<number>>;
  minimum: number;
  maximum: number;
  stepSize: number;
  labelStepSize: number;
}) {
  return (
    <div className="px-2">
      <Slider
        onChange={(value) => {
          console.log("Setting state");
          props.setSliderState(() => value);
        }}
        min={props.minimum}
        max={props.maximum}
        stepSize={props.stepSize}
        value={props.sliderState}
        initialValue={0}
        labelStepSize={props.labelStepSize}
        className="px-2 m-0"
      />
    </div>
  );
}
