// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import {
    IOConfiguration,
    IOPointConfiguration,
    IOPointType,
} from '@/lib/models/api_models';
import {
    IRosTypeR2CInterfacesAnalogInHardwareConfig,
    IRosTypeR2CInterfacesAnalogOutHardwareConfig,
    IRosTypeR2CInterfacesDigitalInHardwareConfig,
    IRosTypeR2CInterfacesDigitalOutHardwareConfig,
} from '@/lib/models/ros_types';
import { createAction, createReducer, UnknownAction } from '@reduxjs/toolkit';
import { createContext, Dispatch, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique IDs

interface IOPointContextInterface {
    IOPoints: IOConfiguration;
    setIOPoints: Dispatch<UnknownAction>;
}

interface IOPointContextReducerInterface {
    point: IOPointConfiguration;
    index?: number;
}

interface IOPointContextReducerDeleteInterface {
    point: IOPointConfiguration;
    index: number;
}

interface IOPointContextReducerReorderInterface {
    point_type: IOPointType;
    source_channel: number;
    destination_channel: number;
}

interface IOConfigurationContextReducerInterface {
    configuration: IOConfiguration;
}

interface IOPointContextReducerUpdateConfigurationInterface {
    point_type: IOPointType;
    point_configuration_states:
        | IRosTypeR2CInterfacesDigitalInHardwareConfig[]
        | IRosTypeR2CInterfacesDigitalOutHardwareConfig[]
        | IRosTypeR2CInterfacesAnalogInHardwareConfig[]
        | IRosTypeR2CInterfacesAnalogOutHardwareConfig[];
}

interface setIOPointsDispatchInterface {
    payload:
        | IOPointContextReducerInterface
        | IOPointContextReducerDeleteInterface
        | IOPointContextReducerReorderInterface
        | IOConfigurationContextReducerInterface;
    type: string;
}

export const IOPointContext = createContext<IOPointContextInterface>(null);

export const IOPointContextProvider = ({ children }) => {
    const updateIOPointAction = createAction<IOPointContextReducerInterface>(
        'config/update_point'
    );
    const addIOPointAction =
        createAction<IOPointContextReducerInterface>('config/add');
    const deleteIOPointAction =
        createAction<IOPointContextReducerDeleteInterface>('config/delete');
    const setIOPointsAction =
        createAction<IOConfigurationContextReducerInterface>('config/set');
    const reorderIOPointsAction =
        createAction<IOPointContextReducerReorderInterface>('config/reorder');
    const updateGpioConfigurationAction =
        createAction<IOPointContextReducerUpdateConfigurationInterface>(
            'config/update'
        );

    const initialIOPoints = new IOConfiguration();

    const setIOPointsReducer = createReducer(initialIOPoints, (builder) => {
        builder
            .addCase(updateIOPointAction, (state, action) => {
                console.log('updated');
                state.insertPointByChannel(
                    action.payload.point,
                    action.payload.point.channel
                );
                return state;
            })
            .addCase(setIOPointsAction, (state, action) => {
                state = action.payload.configuration;
                return state;
            })
            .addCase(addIOPointAction, (state, action) => {
                let point = action.payload.point;

                if (point.channel > state.getMaximumChannels(point.type))
                    return;

                // Find the first available channel
                const usedChannels = state
                    .getIOPoints(point.type)
                    .filter((p) => p.label && p.configured == true)
                    .map((point) => point.channel);

                const availableChannel = [
                    ...Array(state.getMaximumChannels(point.type)).keys(),
                ].find((channel) => !usedChannels.includes(channel));

                point.id = uuidv4();
                point.channel = availableChannel;
                state.insertPointByChannel(point, availableChannel);
                console.log('added');
                return state;
            })
            .addCase(deleteIOPointAction, (state, action) => {
                console.log('point deleted');
                let point = action.payload.point;
                state.resetPointByChannel(point, point.channel);

                return state;
            })
            .addCase(reorderIOPointsAction, (state, action) => {
                console.log('point reordered');
                state.reorderPointByIndex(
                    action.payload.point_type,
                    action.payload.source_channel,
                    action.payload.destination_channel
                );
                return state;
            })
            .addCase(updateGpioConfigurationAction, (state, action) => {
                state
                    .getIOPoints(action.payload.point_type)
                    .forEach((point, point_index) => {
                        if (point.channel !== null) {
                            point.enabled =
                                action.payload.point_configuration_states[
                                    point.channel
                                ].enabled;
                            point.mcu_configuration_valid =
                                action.payload.point_configuration_states[
                                    point.channel
                                ].configured;
                        }
                    });
                return state;
            });
    });

    const [IOPoints, setIOPoints] = useReducer(
        setIOPointsReducer,
        initialIOPoints
    );

    return (
        <IOPointContext.Provider
            value={{
                IOPoints,
                setIOPoints,
            }}
        >
            {children}
        </IOPointContext.Provider>
    );
};
