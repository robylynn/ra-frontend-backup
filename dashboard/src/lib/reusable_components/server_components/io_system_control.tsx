// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import {
  AnalogInputControl,
  AnalogOutputControl,
  DigitalInputControl,
  DigitalOutputControl,
  IOPointControl,
} from "@/lib/reusable_components/client_components/io_point_components";
import { IOPoint, IOPointType } from "@/lib/reusable_models/api_models";
import { OVERFLOW_LIST_SPACER } from "@blueprintjs/core/lib/esm/common/classes";
// import { IOModuleState } from "@/lib/reusable_models/database_models";

export default function IOSystemControl(props: {
  io_points: Array<IOPoint>;
  classname?: string;
}) {
  return (
    <>
      <PointTypeIOSystemControl
        point_type={IOPointType.DIGITAL_INPUT}  
        io_points={props.io_points}
      />
      <PointTypeIOSystemControl
        point_type={IOPointType.DIGITAL_OUTPUT}
        io_points={props.io_points}
      />
      <PointTypeIOSystemControl
        point_type={IOPointType.ANALOG_VOLTAGE_INPUT}
        io_points={props.io_points}
      />
      <PointTypeIOSystemControl
        point_type={IOPointType.ANALOG_VOLTAGE_OUTPUT}
        io_points={props.io_points}
      />
    </>
  )
}

export function PointTypeIOSystemControl(props: {
  point_type: IOPointType;
  io_points: Array<IOPoint>;
  classname?: string;
  // module_state: IOModuleState;
}) {
  return (
    <div className="p-2 m-2 border-2 border-purple-600 rounded-md bg-slate-300">
      {/* <p className="font-bold">{`Module ${props.module.module_index}: ${props.module.module_name}`}</p> */}
      {/* <p className="font-bold">{`RA IO System`}</p> */}
      <p className="font-bold">{IOPointType[props.point_type]}</p>
      <div className="flex flex-col space-y-1">
        {props.io_points.map((point) => {
          // {props.module.io_points.map((point, point_index) => {
          const plc_point_index = point.point_index;
          const point_state =
            // props.module_state.get_io_point_state(plc_point_index).value;
            point.state;
          
          if (point.point_type != props.point_type) {
            return <></>;
          }

          switch (point.point_type) {
            case IOPointType.ANALOG_VOLTAGE_INPUT:
            case IOPointType.ANALOG_CURRENT_INPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state ?? 0}
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
                  point_state={point_state ?? 0}
                >
                  <AnalogOutputControl
                    point={point}
                    module_index={0}
                    point_state={point_state ?? 0}
                  />
                </IOPointControl>
              );
            case IOPointType.DIGITAL_INPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state ?? false}
                >
                  <DigitalInputControl
                    module_index={0}
                    point={point}
                    point_state={point_state ?? false}
                  />
                </IOPointControl>
              );
            case IOPointType.DIGITAL_OUTPUT:
              return (
                <IOPointControl
                  point_index={plc_point_index}
                  point_state={point_state ?? false}
                >
                  <DigitalOutputControl
                    point={point}
                    module_index={0}
                    point_state={point_state ?? false}
                  />
                </IOPointControl>
              );
          }
        })}
      </div>
    </div>
  );
}
