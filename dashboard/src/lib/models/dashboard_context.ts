// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Dispatch, SetStateAction, createContext } from "react";

import {
  DatabaseDocument,
  DatabaseIOStateArray,
  DatabaseMessageArray,
} from "@/lib/models/database_models";

import { 
  UIConfiguration, 
  // ConnectedDeviceInterface
} from "./api_models";

// export type DashboardContextInterface = {
//   latest_document: DatabaseDocument;
//   messages: DatabaseMessageArray;
//   configuration: UIConfiguration;
//   io_state: DatabaseIOStateArray;
//   heartbeat: boolean;
//   database_online: boolean;
//   ra_websocket?: WebSocket | null;
//   // clients: ConnectedDeviceInterface[];
// }

export class ApplicationContext {
  latest_document: DatabaseDocument | null = null;
  messages: DatabaseMessageArray | null = null;
  configuration: UIConfiguration | null = null;
  io_state: DatabaseIOStateArray | null = null;
  heartbeat: boolean = false
  database_online: boolean = false;
  ra_websocket: WebSocket | null = null;

  constructor() {
    // this.latest_document = new DatabaseDocument()
    this.latest_document = new DatabaseDocument();
    this.configuration = new UIConfiguration();
    this.messages = new DatabaseMessageArray();
    this.io_state = new DatabaseIOStateArray();
  }

}

// export type ContextType = {
//   latest_document: DatabaseDocument;
//   messages: DatabaseMessageArray;
//   configuration: UIConfiguration;
//   io_state: DatabaseIOStateArray;
//   heartbeat: boolean;
//   database_online: boolean;
//   ra_websocket: WebSocket | null;// | undefined;
// } 

// const document: DatabaseDocument = new DatabaseDocument();
// const ui_configuration: UIConfiguration = new UIConfiguration();
// const messages: DatabaseMessageArray = new DatabaseMessageArray();
// const io_state: DatabaseIOStateArray = new DatabaseIOStateArray();
// const ra_websocket = new WebSocket("ws://127.0.0.1:3000/api/socket")
// const clients: Array<ConnectedDeviceInterface> = new Array<ConnectedDeviceInterface>();

//const setter: Dispatch<SetStateAction<DashboardContextInterface>> = () => {};
const setter: Dispatch<SetStateAction<ApplicationContext>> = () => {};

const DashboardContext = createContext({
  context: new ApplicationContext(),
  setContext: setter,
});

export default DashboardContext;
