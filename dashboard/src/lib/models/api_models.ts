// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextResponse } from "next/server";

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

export interface UIConfigurationInterface {
  client_id: number | undefined;
}

export class UIConfiguration implements UIConfigurationInterface {
  client_id: number | undefined;
  configured: boolean = false;

  constructor(input?: UIConfigurationInterface) {
    if (input != undefined) {
      this.client_id = input.client_id;
      this.configured = true;
    }
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
  ANALOG_VOLTAGE_INPUT,
  ANALOG_CURRENT_INPUT,
  ANALOG_VOLTAGE_OUTPUT,
  ANALOG_CURRENT_OUTPUT,
  DIGITAL_INPUT,
  DIGITAL_OUTPUT,
}

export enum TransferFunctionType {
  LINEAR,
  CUSTOM,
}

export interface IOPointConfigurationInterface {
  channel: number;
  type: IOPointType;
  enabled: boolean;
  label?: string;
  transfer_function_type?: TransferFunctionType;
  measurement_unit?: string;
  min_value?: number;
  min_signal_v?: number;
  max_value?: number;
  max_signal_v?: number;
}

export class IOPointConfiguration implements IOPointConfigurationInterface {
  channel: number;
  type: IOPointType;
  enabled: boolean;
  label: string;
  transfer_function_type: TransferFunctionType;
  measurement_unit: string;
  min_value: number;
  min_signal_v: number;
  max_value: number;
  max_signal_v: number;

  constructor(input: IOPointConfigurationInterface) {
    this.channel = input.channel;
    this.label = input.label ?? "";
    this.enabled = input.enabled ?? false;
    this.type =
      typeof input.type === "string"
        ? IOPointType[(input.type ?? "NULL") as keyof typeof IOPointType]
        : (input.type as IOPointType);
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
  }
}

export interface IOConfigurationInterface {
  digital_inputs: Array<IOPointConfigurationInterface>;
  digital_outputs: Array<IOPointConfigurationInterface>;
}

export class IOConfiguration implements IOConfigurationInterface {
  digital_inputs: Array<IOPointConfiguration> = [];
  digital_outputs: Array<IOPointConfiguration> = [];

  constructor(input: IOConfigurationInterface) {
    input.digital_inputs.forEach((i) => {
      this.digital_inputs.push(new IOPointConfiguration(i));
    });

    input.digital_outputs.forEach((o) => {
      this.digital_outputs.push(new IOPointConfiguration(o));
    });
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
