// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client'

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useReducer,
} from 'react'

import {
    ApplicationContext,
    ConfigServices,
} from '@/lib/models/dashboard_context'
import {
    HardwareConfiguration,
    IOPointType,
    PlotConfiguration,
    UIConfiguration,
} from '@/lib/models/api_models'
import { AnalogInData, AxisData, DigitalInData } from '@/lib/models/ros_models'
import { createAction, createReducer, UnknownAction } from '@reduxjs/toolkit'
import ROSLIB from 'roslib'

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
    dashboardContext: ApplicationContext
    // setDashboardContext: Dispatch<
    //     SetStateAction<setDashboardContextDispatchInterface>
    // >
    setDashboardContext: Dispatch<
        UnknownAction
    >
}

export const DashboardContext = createContext<DashboardContextInterface>(null)

export default function DashboardContextProvider(props: {
    children: ReactNode
}) {
    const initialDashboardContext = new ApplicationContext()

    const setUIConfigurationAction = createAction<{
        configuration: UIConfiguration
    }>('ui_config/set')
    const incrementHeartbeatAction = createAction<{ heartbeat_valid: boolean }>(
        'heartbeat/rx'
    )
    const setHardwareConfigurationAction = createAction<{
        hardware_configuration: HardwareConfiguration
    }>('hardware_config/set')
    const setROSAction = createAction<{
        ros_config_services: ConfigServices
        ra_ros_websocket: ROSLIB.Ros
    }>('ros/set')
    const setAnalogInDataAction = createAction<{
        analog_in_data: AnalogInData
    }>('data/analog_in')
    const setDigitalInDataAction = createAction<{
        digital_in_data: DigitalInData
    }>('data/digital_in')
    const setAxisDataAction = createAction<{
        axis_index: number
        axis_data: AxisData
    }>('data/axis')
    const addPlotAction = createAction<{
        plot_type: IOPointType
        configuration: PlotConfiguration
    }>('plots/add')
    const addMotionPlotAction = createAction<{
        configuration: PlotConfiguration
    }>('motion_plots/add')
    const updatePlotConfiguration =
        createAction<ModifyPlotInterface>('plots/update')
    const updateMotionPlotConfiguration = createAction<ModifyPlotInterface>(
        'motion_plots/update'
    )
    const deletePlotAction = createAction<{
        plot_type: IOPointType
        plot_index: number
    }>('plots/delete')
    const deleteMotionPlotAction = createAction<{ plot_index: number }>(
        'motion_plots/delete'
    )

    function updatePlot(
        plot_configurations: PlotConfiguration[],
        payload: ModifyPlotInterface
    ): PlotConfiguration[] {
        if (payload.data_sources)
            plot_configurations[payload.plot_index].data_sources =
                payload.data_sources

        if (payload.update_rate)
            plot_configurations[payload.plot_index].update_rate =
                payload.update_rate

        if (payload.length)
            plot_configurations[payload.plot_index].length = payload.length

        return plot_configurations
    }

    function deletePlot(
        plot_configurations: PlotConfiguration[],
        payload: ModifyPlotInterface
    ): PlotConfiguration[] {
        delete plot_configurations[payload.plot_index]
        plot_configurations = plot_configurations.filter((plot) => plot)

        return plot_configurations
    }

    const setDashboardContextReducer = createReducer(
        initialDashboardContext,
        (builder) => {
            builder
                .addCase(setUIConfigurationAction, (state, action) => {
                    state.configuration = action.payload.configuration
                    return state
                })
                .addCase(incrementHeartbeatAction, (state, action) => {
                    state.heartbeat = action.payload.heartbeat_valid
                    if (action.payload.heartbeat_valid) {
                        state.heartbeat_counter++
                    }
                    return state
                })
                .addCase(setHardwareConfigurationAction, (state, action) => {
                    state.hardware_configuration =
                        action.payload.hardware_configuration
                    return state
                })
                .addCase(setROSAction, (state, action) => {
                    state.ra_ros_websocket = action.payload.ra_ros_websocket
                    state.IO_config_services =
                        action.payload.ros_config_services
                    return state
                })
                .addCase(setAnalogInDataAction, (state, action) => {
                    state.analog_in_data = action.payload.analog_in_data
                    return state
                })
                .addCase(setDigitalInDataAction, (state, action) => {
                    state.digital_in_data = action.payload.digital_in_data
                    return state
                })
                .addCase(setAxisDataAction, (state, action) => {
                    state.axis_data[action.payload.axis_index] =
                        action.payload.axis_data
                    return state
                })
                .addCase(addPlotAction, (state, action) => {
                    state.configuration.io_plots[action.payload.plot_type].push(
                        action.payload.configuration
                    )
                    return state
                })
                .addCase(addMotionPlotAction, (state, action) => {
                    state.configuration.motion_plots.push(
                        action.payload.configuration
                    )
                    return state
                })
                .addCase(updatePlotConfiguration, (state, action) => {
                    updatePlot(
                        state.configuration.io_plots[action.payload.plot_type],
                        action.payload
                    )
                    return state
                })
                .addCase(updateMotionPlotConfiguration, (state, action) => {
                    updatePlot(state.configuration.motion_plots, action.payload)
                    return state
                })
                .addCase(deletePlotAction, (state, action) => {
                    deletePlot(
                        state.configuration.io_plots[action.payload.plot_type],
                        action.payload
                    )
                    return state
                })
                .addCase(deleteMotionPlotAction, (state, action) => {
                    deletePlot(state.configuration.motion_plots, action.payload)
                    return state
                })
        }
    )

    const [context, setContext] = useReducer(
        setDashboardContextReducer,
        initialDashboardContext
    )

    return (
        <DashboardContext.Provider
            value={{
                dashboardContext: context,
                setDashboardContext: setContext,
            }}
        >
            {props.children}
        </DashboardContext.Provider>
    )
}
