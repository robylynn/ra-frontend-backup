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
  data_sources: Array<string>;
  data_length: number
}

export class PlotConfiguration implements PlotConfigurationInterface {
  enabled: boolean;
  data_sources: Array<string> = [];
  data_length: number

  constructor(input?: PlotConfigurationInterface) {
    this.enabled = input.enabled;
    this.data_length = input?.data_length;
    input.data_sources.forEach((d) => {
      this.data_sources.push(d);
    });
  }
}

export interface UIConfigurationInterface {
  client_id: number | undefined;
  plots: Array<PlotConfigurationInterface>;
}

export class UIConfiguration implements UIConfigurationInterface {
  client_id: number | undefined;
  plots: Array<PlotConfiguration> = [];

  configured: boolean = false;

  public copy() : UIConfiguration {
    let config = new UIConfiguration();
    Object.assign(config, this);
    return config;
  }

  constructor(input?: UIConfigurationInterface) {
    if (input != undefined) {
      this.client_id = input.client_id;
      input.plots.forEach((p) => {
        this.plots.push(new PlotConfiguration(p));
      });

      this.configured = true;
    }
  }

  public plot_active(plot_index: number) {
    return this.plots.length > plot_index;
  }

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

export enum AnalogIOPointType {
  VOLTAGE,
  CURRENT,
}

export enum TransferFunctionType {
  LINEAR,
  CUSTOM,
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

export class IOPointConfiguration implements IOPointConfigurationInterface {
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

  constructor(input: IOPointConfigurationInterface) {
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
    [IOPointType.ANALOG_INPUT]: 8,
    [IOPointType.ANALOG_OUTPUT]: 8,
    [IOPointType.NULL]: 8,
  };

  digital_inputs: Array<IOPointConfiguration> = [];
  digital_outputs: Array<IOPointConfiguration> = [];
  analog_inputs: Array<IOPointConfiguration> = [];
  analog_outputs: Array<IOPointConfiguration> = [];

  initialized: boolean = false;

  public copy() : IOConfiguration {
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
  }

  public assignUUIDs() {
    this.analog_inputs.forEach(p => {
      p.id = uuidv4()
    })

    this.analog_outputs.forEach(p => {
      p.id = uuidv4()
    })

    this.digital_inputs.forEach(p => {
      p.id = uuidv4()
    })

    this.digital_outputs.forEach(p => {
      p.id = uuidv4()
    })
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

  public getConfiguredIOPoints(point_type: IOPointType): Array<IOPointConfiguration> {
    return this.getIOPoints(point_type).filter(p => p.configured);
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

  public getNextAvailablePointIndex(point_type): number {
    let point_array = this.getIOPoints(point_type);
    if (point_array.length > 0) {
      for (const point of point_array) {
        if (!point.label) {
          return point.channel;
        }
      }
      return -1;
    } else {
      return 0;
    }
    // try {
    //   switch (point_type) {
    //     case IOPointType.DIGITAL_INPUT:
    //       point_array = this.digital_inputs;
    //       break;
    //     case IOPointType.DIGITAL_OUTPUT:
    //       point_array = this.digital_outputs;
    //       break;
    //     case IOPointType.ANALOG_INPUT:
    //       point_array = this.analog_inputs;
    //       break;
    //     case IOPointType.ANALOG_OUTPUT:
    //       point_array = this.analog_outputs;
    //       break;
    //     default:
    //       return;
    //   }
      
    //   let [moved_point] = point_array.splice(source_index, 1);
    //   point_array.splice(destination_index, 0, moved_point);
    // } catch (e) {
    //   console.log(
    //     `Point index ${source_index} with type ${IOPointType[point_type]} does not exist`
    //   );
    // }
  }
}

export interface HardwareConfigurationInterface {
  io_system: IOConfigurationInterface;
}

export class HardwareConfiguration implements HardwareConfigurationInterface {
  io_system: IOConfiguration;

  constructor(input: HardwareConfigurationInterface) {
    this.io_system = new IOConfiguration(input.io_system);
  }
}
