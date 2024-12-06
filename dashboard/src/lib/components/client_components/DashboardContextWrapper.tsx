// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { ReactNode, useState, useReducer, createContext, Dispatch, SetStateAction } from "react";

import { ApplicationContext, ConfigServices } from "@/lib/models/dashboard_context";
// import RAStateContext, { StateContext } from "@/lib/models/ros_state_context";
import { createAction, createReducer, ActionCreatorWithOptionalPayload, Reducer, Action } from '@reduxjs/toolkit'
import { HardwareConfiguration, PlotConfiguration, UIConfiguration, IOPointType } from "@/lib/models/api_models";
import { AnalogInData, AxisData, DigitalInData } from "@/lib/models/ros_models";
import ROSLIB from "roslib";

interface ModifyPlotInterface {
  plot_index: number
  plot_type?: IOPointType
  data_sources?: Array<number>
  update_rate?: number
  length?: number
}

interface setDashboardContextDispatchInterface {
  payload: ModifyPlotInterface | any
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
  const addPlotAction = createAction<{plot_type: IOPointType, configuration: PlotConfiguration}>('plots/add')
  const addMotionPlotAction = createAction<{configuration: PlotConfiguration}>('motion_plots/add')
  const updatePlotConfiguration = createAction<ModifyPlotInterface>('plots/update')
  const updateMotionPlotConfiguration = createAction<ModifyPlotInterface>('motion_plots/update')
  const deletePlotAction = createAction<{plot_type: IOPointType, plot_index: number}>('plots/delete');
  const deleteMotionPlotAction = createAction<{plot_index: number}>('motion_plots/delete');

  function updatePlot(plot_configurations: PlotConfiguration[], payload: ModifyPlotInterface) : PlotConfiguration[] {
    if (payload.data_sources)
      // if (payload.plot_type)
      //   plot_configurations[payload.plot_type][payload.plot_index].data_sources = payload.data_sources;
      // else
        plot_configurations[payload.plot_index].data_sources = payload.data_sources;
    
    if (payload.update_rate)
      // if (payload.plot_type)
      //   plot_configurations[payload.plot_type][payload.plot_index].update_rate = payload.update_rate;
      // else
        plot_configurations[payload.plot_index].update_rate = payload.update_rate;

    if (payload.length)
      // if (payload.plot_type)
      //   plot_configurations[payload.plot_type][payload.plot_index].length = payload.length;
      // else
        plot_configurations[payload.plot_index].length = payload.length;

    return plot_configurations;
  }

  function deletePlot(plot_configurations: PlotConfiguration[], payload: ModifyPlotInterface) : PlotConfiguration[] {
    delete plot_configurations[payload.plot_index];
    plot_configurations = plot_configurations.filter((plot) => plot);

    return plot_configurations;
  }
  
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
      state.configuration.io_plots[action.payload.plot_type].push(
        action.payload.configuration
      );
      return state;
    })
    .addCase(addMotionPlotAction, (state, action) => {
      state.configuration.motion_plots.push(
        action.payload.configuration
      );
      return state;
    })
    .addCase(updatePlotConfiguration, (state, action) => {
      updatePlot(state.configuration.io_plots[action.payload.plot_type], action.payload)
      // if (action.payload.data_sources)
      //   state.configuration.plots[action.payload.plot_index].data_sources = action.payload.data_sources;
      
      // if (action.payload.update_rate)
      //   state.configuration.plots[action.payload.plot_index].update_rate = action.payload.update_rate;

      // if (action.payload.length)
      //   state.configuration.plots[action.payload.plot_index].length = action.payload.length;

      return state;
    })
    .addCase(updateMotionPlotConfiguration, (state, action) => {
      updatePlot(state.configuration.motion_plots, action.payload)
      // if (action.payload.data_sources)
      //   state.configuration.plots[action.payload.plot_index].data_sources = action.payload.data_sources;
      
      // if (action.payload.update_rate)
      //   state.configuration.plots[action.payload.plot_index].update_rate = action.payload.update_rate;

      // if (action.payload.length)
      //   state.configuration.plots[action.payload.plot_index].length = action.payload.length;

      return state;
    })
    .addCase(deletePlotAction, (state, action) => {
      deletePlot(state.configuration.io_plots[action.payload.plot_type], action.payload)
      // delete state.configuration.plots[action.payload.plot_index];
      // state.configuration.plots = state.configuration.plots.filter((plot) => plot);
      return state;
    })
    .addCase(deleteMotionPlotAction, (state, action) => {
      deletePlot(state.configuration.motion_plots, action.payload)
      // delete state.configuration.plots[action.payload.plot_index];
      // state.configuration.plots = state.configuration.plots.filter((plot) => plot);
      return state;
    })
  })

  const [context, setContext] = useReducer(setDashboardContextReducer, initialDashboardContext)

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
