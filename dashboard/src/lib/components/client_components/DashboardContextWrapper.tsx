// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { ReactNode, useState, useReducer, createContext, Dispatch, SetStateAction } from "react";

import { ApplicationContext, ConfigServices } from "@/lib/models/dashboard_context";
// import RAStateContext, { StateContext } from "@/lib/models/ros_state_context";
import { createAction, createReducer, ActionCreatorWithOptionalPayload, Reducer, Action } from '@reduxjs/toolkit'
import { HardwareConfiguration, PlotConfiguration, UIConfiguration } from "@/lib/models/api_models";
import { AnalogInData, AxisData, DigitalInData } from "@/lib/models/ros_models";
import ROSLIB from "roslib";

interface setDashboardContextDispatchInterface {
  payload: any
  type: string
}

interface DashboardContextInterface {
  dashboardContext: ApplicationContext;
  setDashboardContext: Dispatch<SetStateAction<setDashboardContextDispatchInterface>>;
}

export const DashboardContext = createContext<DashboardContextInterface>(null);

export default function DashboardContextProvider(props: {
  children: ReactNode;
}) {
  // const [data, setData] = useState<ApplicationContext>(new ApplicationContext());

  // const updateIOPointAction = createAction<IOPointContextReducerInterface>('config/update');
  // const addIOPointAction = createAction<IOPointContextReducerInterface>('config/add');
  // const deleteIOPointAction = createAction<IOPointContextReducerDeleteInterface>('config/delete');
  // const setIOPointsAction = createAction<IOConfigurationContextReducerInterface>('config/set');

  const initialDashboardContext = new ApplicationContext();

  const setUIConfigurationAction = createAction<{configuration: UIConfiguration}>('ui_config/set');
  const incrementHeartbeatAction = createAction<{heartbeat_valid: boolean}>('heartbeat/rx');
  const setHardwareConfigurationAction = createAction<{hardware_configuration: HardwareConfiguration}>('hardware_config/set');
  const setROSAction = createAction<{ros_config_services: ConfigServices, ra_ros_websocket: ROSLIB.Ros}>('ros/set');
  const setAnalogInDataAction = createAction<{analog_in_data: AnalogInData}>('data/analog_in');
  const setDigitalInDataAction = createAction<{digital_in_data: DigitalInData}>('data/digital_in');
  const setAxisDataAction = createAction<{axis_index: number, axis_data: AxisData}>('data/axis');
  const addPlotAction = createAction<{configuration: PlotConfiguration}>('plots/add')
  const deletePlotAction = createAction<{plot_index: number}>('plots/delete');

  const setDashboardContextReducer = createReducer(initialDashboardContext, (builder) => {
    builder.addCase(setUIConfigurationAction, (state, action) => {
      state.configuration = action.payload.configuration;
      return state;
    })
    .addCase(incrementHeartbeatAction, (state, action) => {
      state.heartbeat = action.payload.heartbeat_valid;
      if (action.payload.heartbeat_valid) {
        state.heartbeat_counter++;
      }
      return state;
    })
    .addCase(setHardwareConfigurationAction, (state, action) => {
      state.hardware_configuration = action.payload.hardware_configuration;
      return state;
    })
    // .addCase(setROSAction, (state, action: {payload: {ra_ros_websocket: ROSLIB.Ros, ros_config_services: ConfigServices}, type: string}) => {
    //   state.ra_ros_websocket = action.payload.ra_ros_websocket;
    //   state.IO_config_services = action.payload.ros_config_services;
    //   return state;
    // })
    .addCase(setROSAction, (state, action) => {
      state.ra_ros_websocket = action.payload.ra_ros_websocket;
      state.IO_config_services = action.payload.ros_config_services;
      return state;
    })
    .addCase(setAnalogInDataAction, (state, action) => {
      state.analog_in_data = action.payload.analog_in_data;
      return state;
    })
    .addCase(setDigitalInDataAction, (state, action) => {
      state.digital_in_data = action.payload.digital_in_data
      return state;
    })
    .addCase(setAxisDataAction, (state, action) => {
      state.axis_data[action.payload.axis_index] = action.payload.axis_data;
      return state;
    })
    .addCase(addPlotAction, (state, action) => {
      state.configuration.plots.push(
        action.payload.configuration
      );
      return state;
    })
    .addCase(deletePlotAction, (state, action) => {
      delete state.configuration.plots[action.payload.plot_index];
      state.configuration.plots = state.configuration.plots.filter((plot) => plot);
      return state;
      // state.configuration.plots
    })
    // builder.addCase(updateIOPointAction, (state, action) => {
    //   console.log("updated")
    //   state.insertPointByIndex(action.payload.point, action.payload.index)
    //   return state;
    // })
    // .addCase(setIOPointsAction, (state, action) => {
    //   console.log("points set")
    //   state = action.payload.configuration;
    //   return state;
    // })
    // .addCase(addIOPointAction, (state, action) => {
    //   console.log("points added")
    //   let point = action.payload.point;
  
    //   if (point.channel > state.getMaximumChannels(point.type)) return;
  
    //   // Find the first available channel
    //   const usedChannels = state.getIOPoints(point.type).filter(p => p.label).map(
    //     (point) => point.channel
    //   );
      
    //   const availableChannel = [
    //     ...Array(state.getMaximumChannels(point.type)).keys(),
    //   ].find((channel) => !usedChannels.includes(channel));
  
    //   point.id = uuidv4();
    //   point.channel = availableChannel;
    //   state.insertPointByIndex(point, availableChannel)
    //   console.log("added")
    //   return state;
    // })
    // .addCase(deleteIOPointAction, (state, action) => {
    //   console.log("point deleted")
    //   state.deletePointByIndex(action.payload.point_type, action.payload.index)
    //   return state;
    // })
    // .addCase(reorderIOPointsAction, (state, action) => {
    //   state.reorderPointByIndex(
    //     action.payload.point_type,
    //     action.payload.source_index,
    //     action.payload.destination_index
    //   );
    //   return state;
    // })
  })

  // const [context, setContext] = useReducer<ApplicationContext, (arg: setDashboardContextDispatchInterface) => void>(setDashboardContextReducer, initialDashboardContext, (state, action) : any => {return state})
  // const [context, setContext] = useReducer<ApplicationContext, (arg: setDashboardContextDispatchInterface) => void>(setDashboardContextReducer, initialDashboardContext)
  const [context, setContext] = useReducer(setDashboardContextReducer, initialDashboardContext)

  // const DashboardContext = createContext({
  //   dashboardContext: context,
  //   setDashboardContext: setContext,
  // });

  return (
    <DashboardContext.Provider value={{ dashboardContext: context, setDashboardContext: setContext }}>
      {props.children}
    </DashboardContext.Provider>
  );
}



// export function RAStateContextProvider(props: {
//   children: ReactNode;
// }) {
//   const [data, setData] = useState<StateContext>(new StateContext());

//   return (
//     <RAStateContext.Provider value={{ stateContext: data, setContext: setData }}>
//       {props.children}
//     </RAStateContext.Provider>
//   );
// }
