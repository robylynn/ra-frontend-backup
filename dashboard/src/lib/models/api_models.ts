// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export interface BackendAPIResponseInterface {
  error: boolean;
  data: string | Array<any> | any;
}

export interface NextAPIResponseInterface {
  authenticated: boolean;
  data?: BackendAPIResponseInterface;
  error?: boolean;
  error_string?: string;
}

export function createAPIResponse(res: NextAPIResponseInterface) {
  return NextResponse.json(res);
}

export type LogMessage = {
  timestamp: Date;
  message_text: string;
};

export interface DataSourceInterface {
  data_source_name: string;
}

export class DataSource implements DataSourceInterface {
  data_source_name: string;

  constructor(input?: DataSourceInterface) {
    if (input != undefined) {
      this.data_source_name = input.data_source_name;
    }
  }
}

export interface PlotConfigurationInterface {
  enabled: boolean;
  plot_data_name?: string;
  data_sources: Array<number>;
  length: number;
  update_rate: number;
  plot_type?: string;
}

export class PlotConfiguration implements PlotConfigurationInterface {
  enabled: boolean;
  plot_data_name?: string;
  data_sources: Array<number> = [];
  length: number;
  update_rate: number;
  plot_type?: string;

  constructor(input?: PlotConfigurationInterface) {
    this.enabled = input.enabled;
    this.plot_data_name = input.plot_data_name;
    this.length = input?.length;
    this.update_rate = input.update_rate;
    input.data_sources.forEach((d) => {
      this.data_sources.push(d);
    });
    this.plot_type = input.plot_type;
  }
}

export interface UIConfigurationInterface {
  client_id: number | undefined;
  // io_plots: Array<PlotConfigurationInterface>;
  io_plots: Record<IOPointType | number, Array<PlotConfigurationInterface>>;
  motion_plots: Array<PlotConfigurationInterface>;
}

export class UIConfiguration implements UIConfigurationInterface {
  client_id: number | undefined;
  // io_plots: Array<PlotConfiguration> = [];
  io_plots: Record<IOPointType | number, Array<PlotConfiguration>> = {
    // [IOPointType.NULL]: [],
    [IOPointType.ANALOG_INPUT]: [],
    [IOPointType.ANALOG_OUTPUT]: [],
    [IOPointType.DIGITAL_INPUT]: [],
    [IOPointType.DIGITAL_OUTPUT]: [],
  };
  motion_plots: Array<PlotConfiguration> = [];

  configured: boolean = false;

  public copy(): UIConfiguration {
    let config = new UIConfiguration();
    Object.assign(config, this);
    return config;
  }

  constructor(input?: UIConfigurationInterface) {
    if (input != undefined) {
      this.io_plots = {
        // [IOPointType.NULL]: [],
        [IOPointType.ANALOG_INPUT]: [],
        [IOPointType.ANALOG_OUTPUT]: [],
        [IOPointType.DIGITAL_INPUT]: [],
        [IOPointType.DIGITAL_OUTPUT]: [],
      };

      this.client_id = input.client_id;
      if (input.io_plots != undefined) {
        Object.keys(input.io_plots).forEach((plot_type) => {
          this.io_plots[plot_type as keyof typeof IOPointType] = input.io_plots[
            plot_type as keyof typeof IOPointType
          ].map((p) => new PlotConfiguration(p));
        });
        // input.io_plots?.forEach((p) => {
        //   this.io_plots.push(new PlotConfiguration(p));
        // });
      }

      input.motion_plots?.forEach((p) =>
        this.motion_plots.push(new PlotConfiguration(p))
      );

      this.configured = true;
    }
  }

  // public plot_active(plot_index: number) {
  //   return this.io_plots.length > plot_index;
  // }

  serialize(): UIConfigurationInterface {
    const json_value = JSON.parse(JSON.stringify(this));
    return json_value;
  }
}

////////////////////////////////////////////////
//////////// HARDWARE CONFIGURATION ////////////
////////////////////////////////////////////////

export enum IOPointType {
  NULL,
  // ANALOG_VOLTAGE_INPUT,
  // ANALOG_CURRENT_INPUT,
  // ANALOG_VOLTAGE_OUTPUT,
  // ANALOG_CURRENT_OUTPUT,
  ANALOG_INPUT,
  ANALOG_OUTPUT,
  DIGITAL_INPUT,
  DIGITAL_OUTPUT,
}

export enum AxisDataType {
  NULL,
  VELOCITY,
  POSTIION,
}

export const IOPointTypeFriendlyName: Record<IOPointType, string> = {
  [IOPointType.NULL]: "Null",
  [IOPointType.ANALOG_INPUT]: "Analog Input",
  [IOPointType.ANALOG_OUTPUT]: "Analog Output",
  [IOPointType.DIGITAL_INPUT]: "Digital Input",
  [IOPointType.DIGITAL_OUTPUT]: "Digital Output",
};

export enum AnalogIOPointType {
  VOLTAGE,
  CURRENT,
}

export enum TransferFunctionType {
  LINEAR,
  CUSTOM,
}

export class HardwareComponentConfiguration {
  public get identifier(): number {
    return 0;
  }
}

export interface AxisConfigurationInterface {
  label: string;
  index: number;
}

export class AxisConfiguration
  extends HardwareComponentConfiguration
  implements AxisConfigurationInterface
{
  label: string;
  index: number;

  constructor(input?: AxisConfigurationInterface) {
    super();
    if (input) {
      Object.assign(this, input);
    }
  }

  public get identifier(): number {
    return this.index;
  }
}

export interface IOPointConfigurationInterface {
  id?: string;
  channel: number;
  type: IOPointType;
  analog_type?: AnalogIOPointType;
  enabled: boolean;
  configured: boolean;
  label?: string;
  transfer_function_type?: TransferFunctionType;
  measurement_unit?: string;
  min_value?: number;
  min_signal_v?: number;
  max_value?: number;
  max_signal_v?: number;
  value?: any;
}

export class IOPointConfiguration
  extends HardwareComponentConfiguration
  implements IOPointConfigurationInterface
{
  id: string;
  channel: number;
  type: IOPointType;
  analog_type?: AnalogIOPointType;
  enabled: boolean;
  configured: boolean;
  label: string;
  transfer_function_type: TransferFunctionType;
  measurement_unit: string;
  min_value: number;
  min_signal_v: number;
  max_value: number;
  max_signal_v: number;
  value: any;

  constructor(input?: IOPointConfigurationInterface) {
    super();
    if (input) {
      this.id = input.id;
      this.channel = input.channel;
      this.label = input.label ?? "";
      this.enabled = input.enabled ?? false;
      this.configured = input.configured;
      this.type =
        typeof input.type === "string"
          ? IOPointType[(input.type ?? "NULL") as keyof typeof IOPointType]
          : (input.type as IOPointType);

      if (
        this.type == IOPointType.ANALOG_INPUT ||
        this.type == IOPointType.ANALOG_OUTPUT
      ) {
        this.analog_type =
          typeof input.analog_type === "string"
            ? AnalogIOPointType[
                (input.analog_type ?? "NULL") as keyof typeof AnalogIOPointType
              ]
            : (input.analog_type as AnalogIOPointType);
      }

      this.measurement_unit = input.measurement_unit ?? "";
      this.min_value = input.min_value ?? 0;
      this.max_value = input.max_value ?? 0;
      this.min_signal_v = input.min_signal_v ?? 0;
      this.max_signal_v = input.max_signal_v ?? 0;
      this.transfer_function_type =
        typeof input.type === "string"
          ? TransferFunctionType[
              (input.type ?? "NULL") as keyof typeof TransferFunctionType
            ]
          : (input.transfer_function_type as TransferFunctionType);
      this.value = input.value;
    }
  }

  public get identifier(): number {
    return this.channel;
  }

  public copy(): IOPointConfiguration {
    let copied_configuration = new IOPointConfiguration();
    Object.assign(copied_configuration, this);
    return copied_configuration;
  }
}

export interface IOConfigurationInterface {
  digital_inputs: Array<IOPointConfigurationInterface>;
  digital_outputs: Array<IOPointConfigurationInterface>;
  analog_inputs: Array<IOPointConfigurationInterface>;
  analog_outputs: Array<IOPointConfigurationInterface>;
}

export class IOConfiguration implements IOConfigurationInterface {
  private configuration_constants: Record<IOPointType, number> = {
    [IOPointType.DIGITAL_INPUT]: 8,
    [IOPointType.DIGITAL_OUTPUT]: 8,
    [IOPointType.ANALOG_INPUT]: 3,
    [IOPointType.ANALOG_OUTPUT]: 8,
    [IOPointType.NULL]: 8,
  };

  digital_inputs: Array<IOPointConfiguration> = [];
  digital_outputs: Array<IOPointConfiguration> = [];
  analog_inputs: Array<IOPointConfiguration> = [];
  analog_outputs: Array<IOPointConfiguration> = [];

  initialized: boolean = false;

  public copy(): IOConfiguration {
    let config = new IOConfiguration();
    Object.assign(config, this);
    return config;
  }

  constructor(input?: IOConfigurationInterface) {
    input?.digital_inputs?.forEach((i) => {
      this.digital_inputs.push(new IOPointConfiguration(i));
      this.initialized = true;
    });

    input?.digital_outputs?.forEach((o) => {
      this.digital_outputs.push(new IOPointConfiguration(o));
      this.initialized = true;
    });

    input?.analog_inputs?.forEach((i) => {
      this.analog_inputs.push(new IOPointConfiguration(i));
      this.initialized = true;
    });

    input?.analog_outputs?.forEach((o) => {
      this.analog_outputs.push(new IOPointConfiguration(o));
      this.initialized = true;
    });

    this.configuration_constants = {
      [IOPointType.DIGITAL_INPUT]: 8,
      [IOPointType.DIGITAL_OUTPUT]: 8,
      [IOPointType.ANALOG_INPUT]: 3,
      [IOPointType.ANALOG_OUTPUT]: 8,
      [IOPointType.NULL]: 8,
    };
  }

  public assignUUIDs() {
    this.analog_inputs.forEach((p) => {
      p.id = uuidv4();
    });

    this.analog_outputs.forEach((p) => {
      p.id = uuidv4();
    });

    this.digital_inputs.forEach((p) => {
      p.id = uuidv4();
    });

    this.digital_outputs.forEach((p) => {
      p.id = uuidv4();
    });
  }

  public getMaximumChannels(point_type: IOPointType): number {
    return this.configuration_constants[point_type];
    switch (point_type) {
      case IOPointType.DIGITAL_INPUT:
        if (this.digital_inputs.length == 0) {
          return this.configuration_constants[point_type];
        } else {
          return this.digital_inputs.length;
        }
      case IOPointType.DIGITAL_OUTPUT:
        if (this.digital_outputs.length == 0) {
          return this.configuration_constants[point_type];
        } else {
          return this.digital_outputs.length;
        }
      case IOPointType.ANALOG_INPUT:
        if (this.analog_inputs.length == 0) {
          return this.configuration_constants[point_type];
        } else {
          return this.analog_inputs.length;
        }
      case IOPointType.ANALOG_OUTPUT:
        if (this.analog_outputs.length == 0) {
          return this.configuration_constants[point_type];
        } else {
          return this.analog_inputs.length;
        }
    }
  }

  public getIOPoints(point_type: IOPointType): Array<IOPointConfiguration> {
    switch (point_type) {
      case IOPointType.DIGITAL_INPUT:
        return this.digital_inputs;
      case IOPointType.DIGITAL_OUTPUT:
        return this.digital_outputs;
      case IOPointType.ANALOG_INPUT:
        return this.analog_inputs;
      case IOPointType.ANALOG_OUTPUT:
        return this.analog_outputs;
      default:
        return []; //new Array<IOPointConfiguration>();
    }
  }

  public getConfiguredIOPoints(
    point_type: IOPointType
  ): Array<IOPointConfiguration> {
    return this.getIOPoints(point_type).filter((p) => p.configured);
  }

  public insertPoint(point: IOPointConfiguration) {
    switch (point.type) {
      case IOPointType.DIGITAL_INPUT:
        this.digital_inputs.push(point);
        break;
      case IOPointType.DIGITAL_OUTPUT:
        this.digital_outputs.push(point);
        break;
      case IOPointType.ANALOG_INPUT:
        this.analog_inputs.push(point);
        break;
      case IOPointType.ANALOG_OUTPUT:
        this.analog_outputs.push(point);
        break;
      default:
        break;
    }
  }

  public getPointByIndex(
    point_type: IOPointType,
    index: number
  ): IOPointConfiguration | null {
    try {
      switch (point_type) {
        case IOPointType.DIGITAL_INPUT:
          return this.digital_inputs[index];
        // this.digital_inputs.push(point)
        case IOPointType.DIGITAL_OUTPUT:
          return this.digital_inputs[index];
        case IOPointType.ANALOG_INPUT:
          return this.analog_inputs[index];
        case IOPointType.ANALOG_OUTPUT:
          return this.analog_outputs[index];
        default:
          return null; //new Array<IOPointConfiguration>();
      }
    } catch (e) {
      console.log(
        `Point index ${index} with type ${IOPointType[point_type]} does not exist`
      );
      return null;
    }
  }

  public insertPointByIndex(point: IOPointConfiguration, index: number) {
    try {
      switch (point.type) {
        case IOPointType.DIGITAL_INPUT:
          this.digital_inputs[index] = point;
          break;
        case IOPointType.DIGITAL_OUTPUT:
          this.digital_outputs[index] = point;
          break;
        case IOPointType.ANALOG_INPUT:
          this.analog_inputs[index] = point;
          break;
        case IOPointType.ANALOG_OUTPUT:
          this.analog_outputs[index] = point;
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(
        `Point index ${index} with type ${IOPointType[point.type]} does not exist`
      );
    }
  }

  public deletePointByIndex(point_type: IOPointType, index: number) {
    try {
      switch (point_type) {
        case IOPointType.DIGITAL_INPUT:
          this.digital_inputs.splice(index, 1);
          break;
        case IOPointType.DIGITAL_OUTPUT:
          this.digital_outputs.splice(index, 1);
          break;
        case IOPointType.ANALOG_INPUT:
          this.analog_inputs.splice(index, 1);
          break;
        case IOPointType.ANALOG_OUTPUT:
          this.analog_outputs.splice(index, 1);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(
        `Point index ${index} with type ${IOPointType[point_type]} does not exist`
      );
    }
  }

  public reorderPointByIndex(
    point_type: IOPointType,
    source_index: number,
    destination_index: number
  ) {
    let point_array: Array<IOPointConfiguration>;
    try {
      point_array = this.getIOPoints(point_type);

      // switch (point_type) {
      //   case IOPointType.DIGITAL_INPUT:
      //     point_array = this.digital_inputs;
      //     break;
      //   case IOPointType.DIGITAL_OUTPUT:
      //     point_array = this.digital_outputs;
      //     break;
      //   case IOPointType.ANALOG_INPUT:
      //     point_array = this.analog_inputs;
      //     break;
      //   case IOPointType.ANALOG_OUTPUT:
      //     point_array = this.analog_outputs;
      //     break;
      //   default:
      //     return;
      // }

      let [moved_point] = point_array.splice(source_index, 1);
      point_array.splice(destination_index, 0, moved_point);
    } catch (e) {
      console.log(
        `Point index ${source_index} with type ${IOPointType[point_type]} does not exist`
      );
    }
  }

  // private getPointArray(point_type)

  public isPointAvailable(point_type: IOPointType) {
    const point_array = this.getIOPoints(point_type);
    return (
      point_array.map((p) => p.channel).length >=
      this.configuration_constants[point_type]
    );
  }

  public getNextAvailablePointIndex(point_type: IOPointType): number {
    const point_array = this.getIOPoints(point_type);
    if (point_array.length > 0) {
      const used_channels = point_array.map((p) => p.channel);
      // this.configuration_constants[point_type];
      const possible_channels = [
        ...Array(this.configuration_constants[point_type]).keys(),
      ]
        .filter((c) => !used_channels.includes(c))
        .sort();
      if (possible_channels.length > 0) {
        return possible_channels[0];
      } else {
        return -1;
      }
    } else {
      return 0;
    }
  }
}

export interface HardwareConfigurationInterface {
  io_system: IOConfigurationInterface;
  axes: Array<AxisConfigurationInterface>;
}

export class HardwareConfiguration implements HardwareConfigurationInterface {
  io_system: IOConfiguration;
  axes: Array<AxisConfiguration> = [];

  constructor(input: HardwareConfigurationInterface) {
    this.io_system = new IOConfiguration(input.io_system);
    this.axes = [0, 1, 2, 3].map(
      (axis_index) =>
        new AxisConfiguration({
          index: axis_index,
          label: `axis ${axis_index}`,
        })
    );
  }
}
