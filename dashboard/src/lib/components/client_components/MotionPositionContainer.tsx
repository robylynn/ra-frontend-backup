// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import {
    R2Button,
    R2SliderToggle,
} from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { IRosTypeR2CInterfacesAxisStateAxisIndex } from '@/lib/models/ros_types';
import { ReactElement, useContext, useState } from 'react';

function AxisPositions(props: { available_axes: Array<number> }): ReactElement {
    const { dashboardContext } = useContext(DashboardContext);

    const [axisState, setAxisState] = useState({
        0: { enabled: true },
        1: { enabled: true },
        2: { enabled: true },
        3: { enabled: true },
    });

    const handleToggleChange = (axis: string) => {
        console.log('Toggle changed', axisState[axis]);
        setAxisState((prevState) => ({
            ...prevState,
            [axis]: { enabled: !prevState[axis].enabled },
        }));
    };

    const axisToggle = (axis_index: number) => {
        // const [toggleState, setToggleState] = useState<boolean>(false);
        const axis_available =
            dashboardContext.axis_data?.[axis_index] !== null;
        const axis_enabled =
            dashboardContext.axis_heartbeat?.[axis_index]?.axis_state.state ==
            IRosTypeR2CInterfacesAxisStateAxisIndex.STATE_CLOSED_LOOP_CONTROL;
        return (
            <div className="flex flex-row items-center">
                <p className="text-gray-400">Enable</p>
                <R2SliderToggle
                    on_text={''}
                    enabled={axis_available}
                    state={axis_enabled}
                    onClick={() =>
                        dashboardContext.ros_services.axis_command_services.set_axis_enable(
                            axis_index,
                            !axis_enabled
                        )
                    }
                />
            </div>
        );
    };

    const AxisDataReadout = (props: {
        available: boolean;
        data: number;
        data_label: string;
        className?: string;
    }) => {
        return (
            <p className="text-md text-gray-400 flex flex-row justify-between">
                {props.data_label}:
                <span
                    className={`${props.className ? props.className : 'text-green-400'} font-medium mr-5`}
                >
                    {/* {data.toFixed(2)} */}
                    {props.available ? props.data?.toFixed(2) : (0).toFixed(2)}
                </span>
            </p>
        );
    };

    return (
        <div className="p-2 bg-gray-900 text-white rounded-lg shadow-lg border border-r2-green-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {props.available_axes.map((axis) => {
                    const axisInfo = dashboardContext.axis_data?.[axis];
                    const axisTorque = dashboardContext.axis_torque?.[axis];
                    return (
                        <div
                            key={axis}
                            className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            <h2 className="text-lg font-semibold text-gray-200 mb-2">
                                Axis {axis}
                            </h2>
                            {axisInfo ? (
                                <>
                                    <div className="grid grid-cols-2">
                                        <div>
                                            <AxisDataReadout
                                                available={axis == 0}
                                                data={axisInfo.position}
                                                data_label={'Position'}
                                                className="text-blue-400"
                                            />
                                            <AxisDataReadout
                                                available={axis == 0}
                                                data={axisInfo.velocity}
                                                data_label={'Velocity'}
                                                className="text-green-400"
                                            />
                                            <AxisDataReadout
                                                available={axis == 0}
                                                data={axisTorque?.estimate ?? 0}
                                                data_label={'Torque'}
                                                className="text-red-400"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            {axisToggle(axis)}
                                            <R2Button
                                                text="Clear Fault"
                                                onClick={() => {
                                                    dashboardContext.ros_services.axis_command_services.clear_axis_errors(
                                                        axis
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-md text-gray-400 text-center pt-2">
                                            <span className="text-green-400 font-medium text-center">
                                                {axis == 0
                                                    ? IRosTypeR2CInterfacesAxisStateAxisIndex[
                                                          dashboardContext
                                                              .axis_heartbeat?.[0]
                                                              ?.axis_state.state
                                                      ]
                                                    : 'STATE_UNKNOWN'}
                                            </span>
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    No data available for this axis.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function AxisPositionContainer() {
    return <AxisPositions available_axes={[0, 1, 2, 3]} />;
}
