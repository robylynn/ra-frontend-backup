// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextResponse } from "next/server";

export interface NextAPIResponseInterface {
  authenticated: boolean;
  data: any;
}

export interface BackendAPIResponseInterface {
  error: boolean;
  data: string | Array<any> | any
}

export interface ConnectedDeviceInterface {
  name: string;
  customer: string;
  IP: string;
}

export function createAPIResponse(res: NextAPIResponseInterface) {
  return NextResponse.json(res);
}

export type CommandRequestData = {
  component: string;
  parameter: string;
  value: boolean | number;
  state?: string;
};

export enum StateCommands {
  STOP,
  MANUAL,
  AUTO,
}

export type LogMessage = {
  timestamp: Date;
  message_text: string;
};

export type BackendAPIResponse = {
  authenticated: boolean,
  data: any
}

export interface TraceConfigurationInterface {
  // y_component_name: string;
  y_parameter_name: string;
  color: string;
  label: string;
}

export class TraceConfiguration implements TraceConfigurationInterface {
  // y_component_name: string;
  y_parameter_name: string;
  color: string;
  label: string;

  constructor(input: TraceConfigurationInterface) {
    // this.y_component_name = input.y_component_name;
    this.y_parameter_name = input.y_parameter_name;
    this.color = input.color;
    this.label = input.label;
  }
}

// export interface ParameterConfigurationInterface {
//   name: string;
//   units: string;
// }

// export class ParameterConfiguration implements ParameterConfigurationInterface {
//   name: string;
//   units: string;

//   constructor(input: ParameterConfigurationInterface) {
//     this.name = input.name;
//     this.units = input.units;
//   }
// }

// export interface HardwareComponentConfigurationInterface {
//   name: string;
//   PID_tag: string;
//   parameters: { [parameter_name: string]: ParameterConfigurationInterface };
// }

// export class HardwareComponentConfiguration {
//   name: string;
//   PID_tag: string;
//   parameters: { [parameter_name: string]: ParameterConfiguration } = {};

//   constructor(input: HardwareComponentConfigurationInterface) {
//     this.name = input.name;
//     this.PID_tag = input.PID_tag;
//     for (const key of Object.keys(input.parameters)) {
//       this.parameters[key] = new ParameterConfiguration(input.parameters[key]);
//     }
//   }
// }

//////////////////////////////
/////////// CHARTS ///////////
//////////////////////////////

export interface ChartConfigurationInterface {
  chart_id: string;
  title: string;
  x_axis_label: string;
  y_axis_decimal_places: number;
  max_length: number;
  width_px: number;
  height_px: number;
  trace_configuration: Array<TraceConfigurationInterface>;
}

export class ChartConfiguration {
  chart_id: string = "";
  title: string = "";
  x_axis_label: string = "";
  y_axis_decimal_places: number = 0;
  max_length: number = 0;
  width_px: number = 0;
  height_px: number = 0;
  trace_configuration: Array<TraceConfiguration> = [];

  constructor(input: ChartConfigurationInterface) {
    this.chart_id = input.chart_id;
    this.title = input.title;
    this.x_axis_label = input.x_axis_label;
    this.y_axis_decimal_places = input.y_axis_decimal_places;
    this.max_length = input.max_length;
    this.width_px = input.width_px;
    this.height_px = input.height_px;
    input.trace_configuration.forEach((trace) => {
      this.trace_configuration.push(new TraceConfiguration(trace));
    });
  }
}

export interface UIConfigurationInterface {
  client_id: number | undefined;
  charts: { [chart_name: string]: ChartConfigurationInterface };
  // hardware_configuration: {
  //   [component_name: string]: HardwareComponentConfigurationInterface;
  // };
  // io_modules: Array<IOModuleInterface>; //IOSystemInterface
  io_points: Array<IOPointInterface>;
  // gauges: { [gauge_name: string]: GaugeConfigurationInterface };
}

export class UIConfiguration implements UIConfigurationInterface {
  client_id: number | undefined;
  configured: boolean = false;
  charts: { [chart_name: string]: ChartConfiguration } = {};
  // hardware_configuration: {
  //   [component_name: string]: HardwareComponentConfiguration;
  // } = {};
  // io_modules: IOSystem | undefined;
  io_points: Array<IOPoint> = [];
  // gauges: { [gauge_name: string]: GaugeConfiguration } = {}; // | undefined

  constructor(input?: UIConfigurationInterface) {
    // if (input) {
    if (input != undefined) {
      for (const chart_name of Object.keys(input.charts)) {
        this.charts[chart_name] = new ChartConfiguration(
          input.charts[chart_name],
        );
      }

      // for (const component_name of Object.keys(input.hardware_configuration)) {
      //   this.hardware_configuration[component_name] =
      //     new HardwareComponentConfiguration(
      //       input.hardware_configuration[component_name],
      //     );
      // }

      // this.io_modules = new IOSystem(input.io_modules);
      for (const io_point of input.io_points) {
        this.io_points.push(
          new IOPoint({
            point_index: io_point.point_index,
            point_type: io_point.point_type
          })
        )
      }

      // for (const gauge_name in input.gauges) {
      //   this.gauges[gauge_name] = new GaugeConfiguration(
      //     input.gauges[gauge_name],
      //   );
      // }

      this.client_id = input.client_id;
      this.configured = true;
    }
  }

  // GetPIDTag(component_name: string): string {
  //   if (component_name in this.hardware_configuration) {
  //     return this.hardware_configuration[component_name].PID_tag;
  //   }
  //   return "NA";
  // }

  // GetComponentParameterUnits(
  //   component_name: string,
  //   parameter_name: string,
  // ): string {
  //   if (component_name in this.hardware_configuration) {
  //     if (
  //       parameter_name in this.hardware_configuration[component_name].parameters
  //     ) {
  //       return this.hardware_configuration[component_name].parameters[
  //         parameter_name
  //       ].units;
  //     }
  //   }
  //   return "NA";
  // }

  serialize(): UIConfigurationInterface {
    const json_value = JSON.parse(JSON.stringify(this));
    //json_value.io_modules = this.io_modules?.serialize();
    return json_value;
  }
}

////////////////////////////////
//////////// GAUGES ////////////
////////////////////////////////

export interface GaugeConfigurationInterface {
  gauge_id: string;
  gauge_text: string;
  data_component_name: string;
  data_parameter_name: string;
  gauge_minimum: number;
  gauge_maximum: number;
  gauge_warning_threshold: number;
  gauge_danger_threshold: number;
  gauge_colors_reversed: boolean;
}

export class GaugeConfiguration {
  gauge_id: string = "";
  gauge_text: string = "";
  data_component_name: string = "";
  data_parameter_name: string = "";
  gauge_minimum: number = 0;
  gauge_maximum: number = 0;
  gauge_warning_threshold: number = 0;
  gauge_danger_threshold: number = 0;
  gauge_colors_reversed: boolean = false;

  constructor(input?: GaugeConfigurationInterface) {
    if (input != undefined) {
      Object.assign(this, input);
    }
  }
}

///////////////////////////////////
//////////// IO SYSTEM ////////////
///////////////////////////////////

export enum IOPointType {
  NULL,
  ANALOG_VOLTAGE_INPUT,
  ANALOG_CURRENT_INPUT,
  ANALOG_VOLTAGE_OUTPUT,
  ANALOG_CURRENT_OUTPUT,
  DIGITAL_INPUT,
  DIGITAL_OUTPUT,
}

export interface IOPointInterface {
  point_index: number;
  point_type: string | IOPointType;
}

export class IOPoint implements IOPointInterface {
  point_index: number = -1;
  point_type: IOPointType = IOPointType.NULL;
  state: number | boolean | undefined = undefined;

  constructor(input: IOPointInterface) {
    this.point_type =
      typeof input?.point_type === "string"
        ? IOPointType[
            (input?.point_type ?? "NULL") as keyof typeof IOPointType
          ]
        : (input?.point_type as IOPointType);
    this.point_index = input?.point_index ?? -1;

    switch (this.point_type) {
      case IOPointType.ANALOG_VOLTAGE_INPUT:
      case IOPointType.ANALOG_CURRENT_INPUT:
      case IOPointType.ANALOG_VOLTAGE_OUTPUT:
      case IOPointType.ANALOG_CURRENT_OUTPUT:
        this.state = 0;
        break;
      case IOPointType.DIGITAL_OUTPUT:
      case IOPointType.DIGITAL_INPUT:
        this.state = false;
        break;
      default:
        this.state = undefined;
        break;
    }
  }

  serialize(): IOPointInterface {
    return {
      point_index: this.point_index,
      point_type: this.point_type,
    };
  }
}

// export interface IOModuleInterface {
//   module_index: number;
//   module_name: string;
//   io_points: Array<IOPointInterface>;
// }

// export class IOModule {
//   module_index: number = -1;
//   module_name: string = "";
//   io_points: Array<IOPoint> = [];

//   constructor(input?: IOModuleInterface) {
//     if (input != undefined) {
//       input?.io_points.forEach((input_point, index) => {
//         this.io_points.push(
//           new IOPoint({
//             channel_index: index + 1,
//             channel_type: input_point.channel_type,
//           }),
//         );
//       });

//       this.module_index = input?.module_index;
//       this.module_name = input?.module_name;
//     }
//   }

//   serialize(): IOModuleInterface {
//     const point_array: Array<IOPointInterface> = [];
//     this.io_points.forEach((point) => {
//       point_array.push(point.serialize());
//     });
//     return {
//       module_index: this.module_index,
//       module_name: this.module_name,
//       io_points: point_array,
//     };
//   }
// }

// export interface IOSystemInterface {
//   io_modules: Array<IOModuleInterface>;
// }

// export class IOSystem {
//   io_modules: Array<IOModule> = [];
//   constructor(
//     input?: Array<IOModuleInterface>, //IOSystemInterface
//   ) {
//     if (input != undefined) {
//       input.forEach((module) => {
//         this.io_modules.push(new IOModule(module));
//       });
//     }
//   }

//   serialize(): Array<IOModuleInterface> {
//     const module_array: Array<IOModuleInterface> = [];
//     this.io_modules.forEach((module) => {
//       module_array.push(module.serialize());
//     });
//     return module_array;
//   }
// }
