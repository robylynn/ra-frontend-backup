// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { Dispatch, SetStateAction, createContext } from "react";
import ROSLIB from "roslib";

import {
  DatabaseDocument,
  DatabaseIOStateDocumentArray,
  DatabaseMessageArray,
} from "@/lib/models/database_models";

import {
  HardwareConfiguration,
  UIConfiguration,
} from "@/lib/models/api_models";

export class ApplicationContext {
  latest_document: DatabaseDocument | null = null;
  messages: DatabaseMessageArray | null = null;
  configuration: UIConfiguration | null = null;
  io_state: DatabaseIOStateDocumentArray | null = null;
  hardware_configuration: HardwareConfiguration | null = null;
  heartbeat: boolean = false;
  database_online: boolean = false;
  ra_websocket: WebSocket | null = null;
  ra_ros_websocket: ROSLIB.Ros | null = null;
  config_service: ROSLIB.Service | null = null;

  constructor() {
    this.latest_document = new DatabaseDocument();
    this.configuration = new UIConfiguration();
    this.messages = new DatabaseMessageArray();
    this.io_state = new DatabaseIOStateDocumentArray();
  }
}

const setter: Dispatch<SetStateAction<ApplicationContext>> = () => {};

const DashboardContext = createContext({
  context: new ApplicationContext(),
  setContext: setter,
});

export default DashboardContext;
