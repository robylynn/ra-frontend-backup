// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import {
    IOConfiguration,
    IOPointConfiguration,
    IOPointType,
} from '@/lib/models/api_models';
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
    point_type: IOPointType;
    index: number;
}

interface IOPointContextReducerReorderInterface {
    point_type: IOPointType;
    source_index: number;
    destination_index: number;
}

interface IOConfigurationContextReducerInterface {
    configuration: IOConfiguration;
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
    const updateIOPointAction =
        createAction<IOPointContextReducerInterface>('config/update');
    const addIOPointAction =
        createAction<IOPointContextReducerInterface>('config/add');
    const deleteIOPointAction =
        createAction<IOPointContextReducerDeleteInterface>('config/delete');
    const setIOPointsAction =
        createAction<IOConfigurationContextReducerInterface>('config/set');
    const reorderIOPointsAction =
        createAction<IOPointContextReducerReorderInterface>('config/reorder');

    const initialIOPoints = new IOConfiguration();

    const setIOPointsReducer = createReducer(initialIOPoints, (builder) => {
        builder
            .addCase(updateIOPointAction, (state, action) => {
                console.log('updated');
                state.insertPointByIndex(
                    action.payload.point,
                    action.payload.index
                );
                return state;
            })
            .addCase(setIOPointsAction, (state, action) => {
                console.log('points set');
                state = action.payload.configuration;
                return state;
            })
            .addCase(addIOPointAction, (state, action) => {
                console.log('points added');
                let point = action.payload.point;

                if (point.channel > state.getMaximumChannels(point.type))
                    return;

                // Find the first available channel
                const usedChannels = state
                    .getIOPoints(point.type)
                    .filter((p) => p.label)
                    .map((point) => point.channel);

                const availableChannel = [
                    ...Array(state.getMaximumChannels(point.type)).keys(),
                ].find((channel) => !usedChannels.includes(channel));

                point.id = uuidv4();
                point.channel = availableChannel;
                state.insertPointByIndex(point, availableChannel);
                console.log('added');
                return state;
            })
            .addCase(deleteIOPointAction, (state, action) => {
                console.log('point deleted');
                state.deletePointByIndex(
                    action.payload.point_type,
                    action.payload.index
                );
                return state;
            })
            .addCase(reorderIOPointsAction, (state, action) => {
                state.reorderPointByIndex(
                    action.payload.point_type,
                    action.payload.source_index,
                    action.payload.destination_index
                );
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
