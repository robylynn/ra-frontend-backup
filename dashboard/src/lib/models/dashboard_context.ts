// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

// import { Dispatch, SetStateAction, createContext } from "react";
import ROSLIB from "roslib";
import {immerable, produce} from "immer"

import {
  DatabaseDocument,
  DatabaseIOStateDocumentArray,
  DatabaseMessageArray,
} from "@/lib/models/database_models";

import {
  HardwareConfiguration,
  IOPointType,
  UIConfiguration,
} from "@/lib/models/api_models";
import { AnalogInData, AxisData, DigitalInData } from "@/lib/models/ros_models";

type ConfigServicesMap = Record<IOPointType, ROSLIB.Service | null>;

export class ConfigServices {
  private services: ConfigServicesMap = {
    [IOPointType.DIGITAL_INPUT]: null,
    [IOPointType.DIGITAL_OUTPUT]: null,
    [IOPointType.ANALOG_INPUT]: null,
    [IOPointType.ANALOG_OUTPUT]: null,
    [IOPointType.NULL]: null,
  };

  public constructor() {}

  public get_service(io_point_type: IOPointType) {
    return this.services[io_point_type];
  }

  public set_service(io_point_type: IOPointType, service: ROSLIB.Service) {
    this.services[io_point_type] = service;
  }
}

export class ApplicationContext {
  [immerable] = true
  
  latest_document: DatabaseDocument | null = null;
  messages: DatabaseMessageArray | null = null;
  configuration: UIConfiguration | null = null;
  io_state: DatabaseIOStateDocumentArray | null = null;
  hardware_configuration: HardwareConfiguration | null = null;
  heartbeat: boolean = false;
  heartbeat_counter: number = 0;
  database_online: boolean = false;
  ra_websocket: WebSocket | null = null;
  ra_ros_websocket: ROSLIB.Ros | null = null;
  IO_config_services: ConfigServices;

  // Machine State
  analog_in_data: AnalogInData = null;
  analog_out_data: AnalogInData | null = null;
  digital_in_data: DigitalInData | null = null;
  digital_out_data: DigitalInData | null = null;
  
  // axis_data: Record<number, Array<AxisData>> = null;
  axis_data: Record<number, AxisData> = {};

  constructor() {
    this.latest_document = new DatabaseDocument();
    this.configuration = new UIConfiguration();
    this.messages = new DatabaseMessageArray();
    this.io_state = new DatabaseIOStateDocumentArray();
    this.IO_config_services = new ConfigServices();
  }

  public getIOSState(point_type: IOPointType) {
    switch (point_type) {
      case IOPointType.ANALOG_INPUT:
        return this.analog_in_data;
      case IOPointType.DIGITAL_INPUT:
        return this.digital_in_data;
      case IOPointType.DIGITAL_OUTPUT:
        return this.digital_out_data;
      case IOPointType.ANALOG_OUTPUT:
        return this.analog_out_data;
    }

  }
}

export default ApplicationContext;
