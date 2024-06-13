// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Dispatch, SetStateAction, createContext } from "react";

import {
  DatabaseDocument,
  DatabaseIOStateArray,
  DatabaseMessageArray,
} from "@/lib/reusable_models/database_models";

import { 
  UIConfiguration, 
  ConnectedDeviceInterface
} from "./api_models";

export interface DashboardContextInterface {
  latest_document: DatabaseDocument;
  messages: DatabaseMessageArray;
  configuration: UIConfiguration;
  io_state: DatabaseIOStateArray;
  heartbeat: boolean;
  database_online: boolean;
  clients: ConnectedDeviceInterface[];
}

const document: DatabaseDocument = new DatabaseDocument();
const ui_configuration: UIConfiguration = new UIConfiguration();
const messages: DatabaseMessageArray = new DatabaseMessageArray();
const io_state: DatabaseIOStateArray = new DatabaseIOStateArray();
const clients: Array<ConnectedDeviceInterface> = new Array<ConnectedDeviceInterface>();

const setter: Dispatch<SetStateAction<DashboardContextInterface>> = () => {};

const DashboardContext = createContext({
  context: {
    latest_document: document,
    configuration: ui_configuration,
    messages: messages,
    io_state: io_state,
    heartbeat: false,
    database_online: false,
    clients: clients
  },
  setContext: setter,
});

export default DashboardContext;
