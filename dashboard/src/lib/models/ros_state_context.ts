// Frontend Web Application for RA Products
// Developed by R2 Labs

// "use client";

import { Dispatch, SetStateAction, createContext } from "react";
import ROSLIB from "roslib";

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

// export type ConfigServicesMap = Record<IOPointType, ROSLIB.Service | null>;

// export class ConfigServices {
//   private services: ConfigServicesMap = {
//     [IOPointType.DIGITAL_INPUT]: null,
//     [IOPointType.DIGITAL_OUTPUT]: null,
//     [IOPointType.ANALOG_INPUT]: null,
//     [IOPointType.ANALOG_OUTPUT]: null,
//     [IOPointType.NULL]: null,
//   };

//   public constructor() {}

//   public get_service(io_point_type: IOPointType) {
//     return this.services[io_point_type];
//   }

//   public set_service(io_point_type: IOPointType, service: ROSLIB.Service) {
//     this.services[io_point_type] = service;
//   }
// }

export class StateContext {
  analog_in_data: object | null = null;
  digital_in_data: object | null = null;
//     latest_document: DatabaseDocument | null = null;
//   messages: DatabaseMessageArray | null = null;
//   configuration: UIConfiguration | null = null;
//   io_state: DatabaseIOStateDocumentArray | null = null;
//   hardware_configuration: HardwareConfiguration | null = null;
//   heartbeat: boolean = false;
//   heartbeat_counter: number = 0;
//   database_online: boolean = false;
//   ra_websocket: WebSocket | null = null;
//   ra_ros_websocket: ROSLIB.Ros | null = null;
//   IO_config_services: ConfigServices;

  constructor() {
    this.analog_in_data = null;
    this.digital_in_data = null;
    // this.latest_document = new DatabaseDocument();
    // this.configuration = new UIConfiguration();
    // this.messages = new DatabaseMessageArray();
    // this.io_state = new DatabaseIOStateDocumentArray();
    // this.IO_config_services = new ConfigServices();
  }
}

const setter: Dispatch<SetStateAction<StateContext>> = () => {};

const RAStateContext = createContext({
  stateContext: new StateContext(),
  setContext: setter,
});

export default RAStateContext;
