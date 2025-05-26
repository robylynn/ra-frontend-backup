// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { createContext, Dispatch, ReactNode, useReducer } from 'react';

import {
    HardwareConfiguration,
    IOPointType,
    PlotConfiguration,
    UIConfiguration,
} from '@/lib/models/api_models';
import {
    ApplicationContext,
    ApplicationServices,
    AxisCommandServices,
    IOCommandServices,
    IOConfigurationServices,
} from '@/lib/models/dashboard_context';
import {
    IRosTypeR2CInterfacesAnalogInData,
    IRosTypeR2CInterfacesAnalogOutData,
    IRosTypeR2CInterfacesDigitalInData,
    IRosTypeR2CInterfacesDigitalOutData,
    IRosTypeR2CInterfacesEncoderEstimates,
    IRosTypeR2CInterfacesGpioConfigurationState,
    IRosTypeR2CInterfacesHeartbeat,
    IRosTypeR2CInterfacesTorques,
} from '@/lib/models/ros_types';
import { createAction, createReducer, UnknownAction } from '@reduxjs/toolkit';
import ROSLIB from 'roslib';

interface ModifyPlotInterface {
    plot_index: number;
    plot_type?: IOPointType;
    data_sources?: Array<number>;
    update_rate?: number;
    length?: number;
}

interface setDashboardContextDispatchInterface {
    payload: ModifyPlotInterface | any;
    type: string;
}

interface DashboardContextInterface {
    dashboardContext: ApplicationContext;
    setDashboardContext: Dispatch<UnknownAction>;
}

export const DashboardContext = createContext<DashboardContextInterface>(null);

export default function DashboardContextProvider(props: {
    children: ReactNode;
}) {
    const initialDashboardContext = new ApplicationContext();

    const setUIConfigurationAction = createAction<{
        configuration: UIConfiguration;
    }>('ui_config/set');
    const incrementHeartbeatAction = createAction<{ heartbeat_valid: boolean }>(
        'heartbeat/rx'
    );
    const setHardwareConfigurationAction = createAction<{
        hardware_configuration: HardwareConfiguration;
    }>('hardware_config/set');
    const setROSAction = createAction<{
        ros_config_services: IOConfigurationServices;
        ros_io_state_services: IOCommandServices;
        ros_application_services: ApplicationServices;
        ros_axis_command_services: AxisCommandServices;
        ra_ros_websocket: ROSLIB.Ros;
    }>('ros/set');
    const setAnalogInDataAction = createAction<{
        analog_in_data: IRosTypeR2CInterfacesAnalogInData;
    }>('data/analog_in');
    const setDigitalInDataAction = createAction<{
        digital_in_data: IRosTypeR2CInterfacesDigitalInData;
    }>('data/digital_in');
    const setAnalogOutDataAction = createAction<{
        analog_out_data: IRosTypeR2CInterfacesAnalogOutData;
    }>('data/analog_out');
    const setDigitalOutDataAction = createAction<{
        digital_out_data: IRosTypeR2CInterfacesDigitalOutData;
    }>('data/digital_out');
    const setGpioConfigurationStateAction = createAction<{
        gpio_configuration_state: IRosTypeR2CInterfacesGpioConfigurationState;
    }>('data/gpio_configuration_state');
    const setAxisDataAction = createAction<{
        axis_index: number;
        axis_data: IRosTypeR2CInterfacesEncoderEstimates;
    }>('data/axis');
    const setAxisHeartbeatAction = createAction<{
        axis_index: number;
        heartbeat: IRosTypeR2CInterfacesHeartbeat;
    }>('data/axis_heartbeat');
    const setAxisTorqueAction = createAction<{
        axis_index: number;
        torque: IRosTypeR2CInterfacesTorques;
    }>('data/axis_torque');
    const addPlotAction = createAction<{
        plot_type: IOPointType;
        configuration: PlotConfiguration;
    }>('plots/add');
    const addMotionPlotAction = createAction<{
        configuration: PlotConfiguration;
    }>('motion_plots/add');
    const updatePlotConfiguration =
        createAction<ModifyPlotInterface>('io_plots/update');
    const updateMotionPlotConfiguration = createAction<ModifyPlotInterface>(
        'motion_plots/update'
    );
    const deletePlotAction = createAction<{
        plot_type: IOPointType;
        plot_index: number;
    }>('plots/delete');
    const deleteMotionPlotAction = createAction<{ plot_index: number }>(
        'motion_plots/delete'
    );
    const saveMotionPlotsAction = createAction<{}>('motion_plots/save');
    const saveIOPlotsAction = createAction<{}>('io_plots/save');
    const setApplicationStateAction = createAction<{
        state_name: string;
        state_value: string;
    }>('app/application_state');

    function updatePlot(
        plot_configurations: PlotConfiguration[],
        payload: ModifyPlotInterface
    ): PlotConfiguration[] {
        if (payload.data_sources)
            plot_configurations[payload.plot_index].data_sources =
                payload.data_sources;

        if (payload.update_rate)
            plot_configurations[payload.plot_index].update_rate =
                payload.update_rate;

        if (payload.length)
            plot_configurations[payload.plot_index].length = payload.length;

        return plot_configurations;
    }

    function deletePlot(
        plot_configurations: PlotConfiguration[],
        payload: ModifyPlotInterface
    ): PlotConfiguration[] {
        delete plot_configurations[payload.plot_index];
        plot_configurations = plot_configurations.filter((plot) => plot);

        return plot_configurations;
    }

    const setDashboardContextReducer = createReducer(
        initialDashboardContext,
        (builder) => {
            builder
                .addCase(setUIConfigurationAction, (state, action) => {
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
                    state.hardware_configuration =
                        action.payload.hardware_configuration;
                    return state;
                })
                .addCase(setROSAction, (state, action) => {
                    state.ra_ros_websocket = action.payload.ra_ros_websocket;
                    state.io_configuration_services =
                        action.payload.ros_config_services;
                    state.io_command_services =
                        action.payload.ros_io_state_services;
                    state.application_services =
                        action.payload.ros_application_services;
                    state.axis_command_services =
                        action.payload.ros_axis_command_services;
                    return state;
                })
                .addCase(setAnalogInDataAction, (state, action) => {
                    state.analog_in_data = action.payload.analog_in_data;
                    return state;
                })
                .addCase(setDigitalInDataAction, (state, action) => {
                    state.digital_in_data = action.payload.digital_in_data;
                    return state;
                })
                .addCase(setAnalogOutDataAction, (state, action) => {
                    state.analog_out_data = action.payload.analog_out_data;
                    return state;
                })
                .addCase(setDigitalOutDataAction, (state, action) => {
                    state.digital_out_data = action.payload.digital_out_data;
                    return state;
                })
                .addCase(setGpioConfigurationStateAction, (state, action) => {
                    state.gpio_configuration_state =
                        action.payload.gpio_configuration_state;
                    return state;
                })
                .addCase(setAxisDataAction, (state, action) => {
                    state.axis_data[action.payload.axis_index] =
                        action.payload.axis_data;
                    return state;
                })
                .addCase(setAxisTorqueAction, (state, action) => {
                    state.axis_torque[action.payload.axis_index] =
                        action.payload.torque;
                    return state;
                })
                .addCase(setAxisHeartbeatAction, (state, action) => {
                    state.axis_heartbeat[action.payload.axis_index] =
                        action.payload.heartbeat;
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
                    updatePlot(
                        state.configuration.io_plots[action.payload.plot_type],
                        action.payload
                    );
                    return state;
                })
                .addCase(updateMotionPlotConfiguration, (state, action) => {
                    updatePlot(
                        state.configuration.motion_plots,
                        action.payload
                    );
                    return state;
                })
                .addCase(deletePlotAction, (state, action) => {
                    deletePlot(
                        state.configuration.io_plots[action.payload.plot_type],
                        action.payload
                    );
                    return state;
                })
                .addCase(deleteMotionPlotAction, (state, action) => {
                    deletePlot(
                        state.configuration.motion_plots,
                        action.payload
                    );
                    return state;
                })
                .addCase(saveMotionPlotsAction, (state, action) => {
                    state.configuration.save_motion_plot_configuration();
                    return state;
                })
                .addCase(saveIOPlotsAction, (state, action) => {
                    state.configuration.save_motion_plot_configuration();
                    return state;
                })
                .addCase(setApplicationStateAction, (state, action) => {
                    state.application_state.set_state(
                        action.payload.state_name,
                        action.payload.state_value
                    );
                });
        }
    );

    const [context, setContext] = useReducer(
        setDashboardContextReducer,
        initialDashboardContext
    );

    return (
        <DashboardContext.Provider
            value={{
                dashboardContext: context,
                setDashboardContext: setContext,
            }}
        >
            {props.children}
        </DashboardContext.Provider>
    );
}
