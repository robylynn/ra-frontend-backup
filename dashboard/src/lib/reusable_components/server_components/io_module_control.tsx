// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import {
  AnalogInputControl,
  AnalogOutputControl,
  DigitalInputControl,
  DigitalOutputControl,
  IOPointControl,
} from "@/lib/reusable_components/client_components/io_point_components";
import { IOModule, IOPointType } from "@/lib/reusable_models/api_models";
import { IOModuleState } from "@/lib/reusable_models/database_models";

export default function IOModuleControl(props: {
  module: IOModule;
  classname?: string;
  module_state: IOModuleState;
}) {
  return (
    <div className="p-2 m-2 border-2 border-purple-600 rounded-md bg-slate-300">
      <p className="font-bold">{`Module ${props.module.module_index}: ${props.module.module_name}`}</p>
      <div className="flex flex-col space-y-1">
        {props.module.io_points.map((point) => {
          // {props.module.io_points.map((point, point_index) => {
          const plc_point_index = point.channel_index;
          const point_state =
            props.module_state.get_io_point_state(plc_point_index).value;
          switch (point.channel_type) {
            case IOPointType.ANALOG_VOLTAGE_INPUT:
            case IOPointType.ANALOG_CURRENT_INPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state}
                >
                  <AnalogInputControl
                  // point={point}
                  // module_index={props.module.module_index}
                  // point_state={point_state}
                  />
                </IOPointControl>
              );
            case IOPointType.ANALOG_VOLTAGE_OUTPUT:
            case IOPointType.ANALOG_CURRENT_OUTPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state}
                >
                  <AnalogOutputControl
                    point={point}
                    module_index={props.module.module_index}
                    point_state={point_state}
                  />
                </IOPointControl>
              );
            case IOPointType.DIGITAL_INPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state}
                >
                  <DigitalInputControl
                    module_index={props.module.module_index}
                    point={point}
                    point_state={point_state}
                  />
                </IOPointControl>
              );
            case IOPointType.DIGITAL_OUTPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state}
                >
                  <DigitalOutputControl
                    point={point}
                    module_index={props.module.module_index}
                    point_state={point_state}
                  />
                </IOPointControl>
              );
          }
        })}
      </div>
    </div>
  );
}
