// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { R2SliderToggle } from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
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

    const axisToggle = (axis: string) => {
        return (
            <R2SliderToggle
                text={''}
                state={axisState[axis].enabled}
                // onChange={() => {}}
                onClick={() => handleToggleChange(axis)}
            />
        );
    };

    return (
        <div className="p-2 bg-gray-900 text-white rounded-lg shadow-lg border border-r2-green-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {props.available_axes.map((axis) => {
                    const axisInfo = dashboardContext.axis_data?.[axis];
                    return (
                        <div
                            key={axis}
                            className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-200 mb-2">
                                        Axis {axis}
                                    </h2>
                                    {axisInfo ? (
                                        <>
                                            <p className="text-md text-gray-400">
                                                Position:{' '}
                                                <span className="text-blue-400 font-medium">
                                                    {axis === 0
                                                        ? axisInfo.position.toFixed(
                                                              2
                                                          )
                                                        : (0).toFixed(2)}
                                                </span>
                                            </p>
                                            <p className="text-md text-gray-400">
                                                Velocity:{' '}
                                                <span className="text-green-400 font-medium">
                                                    {axis == 0
                                                        ? axisInfo.velocity.toFixed(
                                                              2
                                                          )
                                                        : (0).toFixed(2)}
                                                </span>
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            No data available for this axis.
                                        </p>
                                    )}
                                </div>
                                {axisInfo ? (
                                    <div>
                                        <h2 className="text-center text-lg font-semibold text-gray-200 mb-2">
                                            Axis Enable
                                        </h2>
                                        {axisToggle(axis.toString())}
                                    </div>
                                ) : null}
                            </div>
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
