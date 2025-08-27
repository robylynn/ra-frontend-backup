'use client';

import { R2Button } from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import DataPlot from '@/lib/components/client_components/DataPlot';
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';
import { AxisDataType, PlotConfiguration } from '@/lib/models/api_models';
import {
    DatabaseROSAxisStateArray,
    ROSAxisStateInterface,
} from '@/lib/models/database_models';
import {
    AxisTimeDataInterface,
    PlotAxisData,
    PlotDataPoint,
    PlotInputData,
    PlotTimeData,
} from '@/lib/models/plotting_models';
import { IRosTypeR2CInterfacesEncoderEstimates } from '@/lib/models/ros_types';
import timeoutFetch from '@/lib/utils/timeoutFetch';
import {
    MutableRefObject,
    ReactElement,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

interface InitialFetchDataInterface {
    time_data: PlotTimeData | null;
    axis_data: Array<IRosTypeR2CInterfacesEncoderEstimates> | null;
}

function MotionPlots(props: {
    available_axes: Array<number>;
    plot_types: Array<string>;
    default_update_rate: number;
    default_length: number;
}): ReactElement {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    const initialCompleteTimeData = props.plot_types.reduce(
        (o, key) => ({ ...o, [key]: {} }),
        {}
    );

    const [completeTimeData, setCompleteTimeData] = useState<
        Record<string, Record<number, Array<AxisTimeDataInterface>>>
    >(initialCompleteTimeData);

    const [bufferedCompleteTimeData, setBufferedCompleteTimeData] = useState<
        Record<string, Record<number, Array<AxisTimeDataInterface>>>
    >(initialCompleteTimeData);

    const initialCompleteAxisData = props.plot_types.reduce(
        (o, key) => ({ ...o, [key]: {} }),
        {}
    );

    const [completeAxisData, setCompleteAxisData] = useState<
        Record<string, PlotAxisData>
    >(initialCompleteAxisData);

    const [bufferedCompleteAxisData, setBufferedCompleteAxisData] = useState<
        Record<string, PlotAxisData>
    >(initialCompleteAxisData);

    const [selectedPlotType, setSelectedPlotType] = useState<string>();

    const initialDataAcquired = useRef<Record<number, Record<number, boolean>>>(
        {}
    );

    const initialDataFetching = useRef<Record<number, Record<number, boolean>>>(
        {}
    );

    useEffect(() => setSelectedPlotType(() => 'velocity'), []);

    const setInitialRef = (
        ref: MutableRefObject<Record<number, Record<number, boolean>>>
    ) => {
        ref.current = dashboardContext.configuration.motion_plots.reduce(
            (data_acquired, plot_configuration, plot_index) => ({
                ...data_acquired,
                [plot_index]: plot_configuration.data_sources.reduce(
                    (data_sources, data_source) => ({
                        ...data_sources,
                        [data_source]: false,
                    }),
                    {}
                ),
            }),
            {}
        );
    };

    useEffect(() => {
        setInitialRef(initialDataAcquired);
        setInitialRef(initialDataFetching);
    }, [dashboardContext.configuration?.configured]);

    useEffect(() => {
        dashboardContext.configuration?.motion_plots.forEach(
            (plot_configuration, plot_index) => {
                if (
                    !Object.keys(initialDataAcquired.current).includes(
                        plot_index.toString()
                    )
                ) {
                    initialDataAcquired.current = {
                        ...initialDataAcquired.current,
                        [plot_index]: plot_configuration.data_sources.reduce(
                            (data_acquired, data_source) => ({
                                ...data_acquired,
                                [data_source]: false,
                            }),
                            {}
                        ),
                    };
                } else {
                    let data_acquired = initialDataAcquired.current[plot_index];
                    plot_configuration.data_sources.forEach((data_source) => {
                        if (
                            !Object.keys(data_acquired).includes(
                                data_source.toString()
                            )
                        ) {
                            data_acquired = {
                                ...data_acquired,
                                [data_source]: false,
                            };
                        }
                    });
                    initialDataAcquired.current = {
                        ...initialDataAcquired.current,
                        [plot_index]: data_acquired,
                    };
                }
            }
        );
    }, [JSON.stringify(dashboardContext.configuration?.motion_plots)]);

    const areAllAxesAcquiredForPlot = (plot_key: string): boolean =>
        Object.keys(initialDataAcquired.current?.[plot_key])
            .map((axis_key) => initialDataAcquired.current[plot_key][axis_key])
            .every((b) => b);

    useEffect(() => {
        const get_initial_data = async (
            axis_index: number,
            length: number
        ): Promise<InitialFetchDataInterface> => {
            let ret: Promise<InitialFetchDataInterface> =
                new Promise<InitialFetchDataInterface>((resolve, reject) =>
                    resolve({ time_data: null, axis_data: null })
                );

            await timeoutFetch<Array<ROSAxisStateInterface>>(
                `/api/backend/historian/axis/${axis_index}?number_of_points=${length}`,
                20000
            )
                .then((data?) => {
                    if (data) {
                        let data_documents = new DatabaseROSAxisStateArray(
                            data
                        );
                        console.log(
                            `Got ${length} database documents for axis ${axis_index}`
                        );

                        const time_data = data_documents.documents
                            .map((d) => ({
                                time: d.stamp.sec + d.stamp.nanosec / 1e9,
                            }))
                            .reverse();

                        const axis_data = data_documents.documents
                            .map((d) => ({
                                stamp: d.stamp,
                                axis_index: axis_index,
                                position: d.position,
                                velocity: d.velocity,
                            }))
                            .reverse();

                        ret = new Promise<InitialFetchDataInterface>(
                            (resolve, reject) =>
                                resolve({
                                    time_data: time_data,
                                    axis_data: axis_data,
                                })
                        );
                    }
                })
                .catch((e) => {
                    console.error(
                        `Error acquiring initial plot data of length ${length} for axis index ${axis_index}: ${e}`
                    );
                });

            return ret;
        };

        const setInitialDataRef = (
            ref: MutableRefObject<Record<number, Record<number, boolean>>>,
            plot_index: number,
            axis_index: number,
            state: boolean
        ) => {
            ref.current = {
                ...ref.current,
                [plot_index]: {
                    ...ref.current[plot_index],
                    [axis_index]: state,
                },
            };
        };

        const checkInitialDataRef = (
            ref: MutableRefObject<Record<number, Record<number, boolean>>>,
            plot_index: number,
            axis_index: number
        ) => {
            try {
                if (ref.current?.[plot_index][axis_index]) {
                    return ref.current[plot_index][axis_index];
                } else {
                    return false;
                }
            } catch (e) {
                let a = 5;
            }
        };

        const fill_initial_data = async () => {
            dashboardContext.configuration.motion_plots.forEach(
                (plot_configuration, plot_index) => {
                    const plot_length = plot_configuration.length;
                    props.available_axes.forEach((axis_index) => {
                        if (
                            !checkInitialDataRef(
                                initialDataAcquired,
                                plot_index,
                                axis_index
                            ) &&
                            !checkInitialDataRef(
                                initialDataFetching,
                                plot_index,
                                axis_index
                            )
                        ) {
                            setInitialDataRef(
                                initialDataFetching,
                                plot_index,
                                axis_index,
                                true
                            );
                            get_initial_data(axis_index, plot_length).then(
                                ({ time_data, axis_data }) => {
                                    setInitialDataRef(
                                        initialDataFetching,
                                        plot_index,
                                        axis_index,
                                        false
                                    );
                                    if (time_data && axis_data) {
                                        setInitialDataRef(
                                            initialDataAcquired,
                                            plot_index,
                                            axis_index,
                                            true
                                        );

                                        setCompleteTimeData((d) => ({
                                            ...d,
                                            [plot_index]: {
                                                ...d[plot_index],
                                                [axis_index]: time_data,
                                            },
                                        }));

                                        setCompleteAxisData((d) => ({
                                            ...d,
                                            [plot_index]: {
                                                ...d[plot_index],
                                                [axis_index]: axis_data,
                                            },
                                        }));
                                    }
                                }
                            );
                        }
                    });
                }
            );
        };

        fill_initial_data();
    }, [
        dashboardContext.heartbeat_counter,
        JSON.stringify(
            dashboardContext.configuration?.motion_plots.map(
                (plot_configuration) => plot_configuration.length
            )
        ),
    ]);

    // useEffect(() => {
    //   setInitialDataRef(
    //     initialDataFetching,
    //     plot_index,
    //     axis_index,
    //     false
    // );
    // }, [
    //   JSON.stringify(
    //     dashboardContext.configuration?.motion_plots.map(
    //         (plot_configuration) => plot_configuration.length
    //     )
    // )
    // ])

    useEffect(() => {
        dashboardContext.configuration?.motion_plots?.forEach(
            (plot_configuration, plot_index) => {
                plot_configuration.data_sources.forEach((axis_index) => {
                    if (initialDataAcquired.current[plot_index][axis_index]) {
                        let last_time: number;
                        try {
                            last_time =
                                completeTimeData[plot_index][axis_index]?.slice(
                                    -1
                                )[0]?.time;
                        } catch (e) {
                            // let a = 5;
                            // initialDataAcquired.current[plot_index][axis_index] = false;
                        }

                        const new_time =
                            dashboardContext.axis_data[axis_index]?.stamp.sec +
                            dashboardContext.axis_data[axis_index]?.stamp
                                .nanosec /
                                1e9;

                        // Only start building the array if the initial fetch is complete
                        if (new_time) {
                            // If this update has a time entry for the selected axis
                            if (new_time != last_time) {
                                // This is a new data point
                                const time_data_point: AxisTimeDataInterface = {
                                    time: new_time,
                                };
                                const axis_data_point =
                                    dashboardContext.axis_data[axis_index];

                                if (
                                    bufferedCompleteTimeData?.[plot_index]?.[
                                        axis_index
                                    ]?.length > 0
                                ) {
                                    setCompleteTimeData((d) => {
                                        return {
                                            ...d,
                                            [plot_index]: {
                                                ...d[plot_index],
                                                [axis_index]: [
                                                    ...d[plot_index]?.[
                                                        axis_index
                                                    ],
                                                    ...bufferedCompleteTimeData[
                                                        plot_index
                                                    ]?.[axis_index],
                                                    time_data_point,
                                                ].slice(
                                                    -plot_configuration.length
                                                ),
                                            },
                                        };
                                    });

                                    setBufferedCompleteTimeData((d) => ({
                                        ...d,
                                        [plot_index]: {
                                            ...d[plot_index],
                                            [axis_index]: [],
                                        },
                                    }));

                                    setCompleteAxisData((d) => ({
                                        ...d,
                                        [plot_index]: {
                                            ...d[plot_index],
                                            [axis_index]: [
                                                ...d[plot_index]?.[axis_index],
                                                ...bufferedCompleteAxisData[
                                                    plot_index
                                                ]?.[axis_index],
                                                axis_data_point,
                                            ].slice(-plot_configuration.length),
                                        },
                                    }));

                                    setBufferedCompleteAxisData((d) => ({
                                        ...d,
                                        [plot_index]: {
                                            ...d[plot_index],
                                            [axis_index]: [],
                                        },
                                    }));
                                } else {
                                    setCompleteTimeData((d) => ({
                                        ...d,
                                        [plot_index]: {
                                            ...d[plot_index],
                                            [axis_index]: [
                                                ...d[plot_index]?.[axis_index],
                                                time_data_point,
                                            ].slice(-plot_configuration.length),
                                        },
                                    }));

                                    setCompleteAxisData((d) => ({
                                        ...d,
                                        [plot_index]: {
                                            ...d[plot_index],
                                            [axis_index]: [
                                                ...d[plot_index]?.[axis_index],
                                                axis_data_point,
                                            ].slice(-plot_configuration.length),
                                        },
                                    }));
                                }
                            }
                        }
                    } else {
                        console.log('Got data before initial data');

                        const new_time =
                            dashboardContext.axis_data[axis_index]?.stamp.sec +
                            dashboardContext.axis_data[axis_index]?.stamp
                                .nanosec /
                                1e9;

                        const time_data_point: AxisTimeDataInterface = {
                            time: new_time,
                        };
                        const axis_data_point =
                            dashboardContext.axis_data[axis_index];

                        setBufferedCompleteTimeData((d) => {
                            if (d?.[plot_index]?.[axis_index] == undefined) {
                                return {
                                    ...d,
                                    [plot_index]: {
                                        ...d?.[plot_index],
                                        [axis_index]: [time_data_point],
                                    },
                                };
                            } else {
                                return {
                                    ...d,
                                    [plot_index]: {
                                        ...d?.[plot_index],
                                        [axis_index]: [
                                            ...d?.[plot_index]?.[axis_index],
                                            time_data_point,
                                        ],
                                    },
                                };
                            }
                        });

                        setBufferedCompleteAxisData((d) => {
                            if (d?.[plot_index]?.[axis_index] == undefined) {
                                return {
                                    ...d,
                                    [plot_index]: {
                                        ...d?.[plot_index],
                                        [axis_index]: [axis_data_point],
                                    },
                                };
                            } else {
                                return {
                                    ...d,
                                    [plot_index]: {
                                        ...d?.[plot_index],
                                        [axis_index]: [
                                            ...d?.[plot_index]?.[axis_index],
                                            axis_data_point,
                                        ],
                                    },
                                };
                            }
                        });
                    }
                });
            }
        );
    }, [dashboardContext.axis_data]);

    const checkDataAcquired = (plot_index: number): boolean => {
        if (initialDataAcquired?.current?.[plot_index]) {
            return Object.keys(
                initialDataAcquired.current?.[plot_index]
            ).reduce(
                (all_data_acquired, axis_index) =>
                    all_data_acquired &&
                    initialDataAcquired.current[plot_index][
                        parseInt(axis_index)
                    ],
                true
            );
        }
        return false;
    };

    const parseDataByType = (
        data: PlotAxisData,
        data_key: string
    ): PlotInputData => {
        // const data_arrays: PlotInputData = Object.keys(data).map(
        //     (axis_index) => ({
        //         name: `Axis ${axis_index}`,
        //         id: parseInt(axis_index),
        //         data: data[parseInt(axis_index)].map(
        //             (data_point) =>
        //                 ({
        //                     [parseInt(axis_index)]: data_point[data_key],
        //                     time:
        //                         data_point.stamp.sec +
        //                         data_point.stamp.nanosec / 1e9,
        //                 }) as PlotDataPoint
        //         ),
        //     })
        // );

        const data_arrays: PlotInputData = Object.keys(data).map(
            (axis_index) => {
                try {
                    return {
                        name: `Axis ${axis_index}`,
                        id: parseInt(axis_index),
                        data: data[parseInt(axis_index)].map(
                            (data_point) =>
                                ({
                                    [parseInt(axis_index)]:
                                        data_point?.[data_key],
                                    time:
                                        data_point?.stamp.sec +
                                        data_point?.stamp.nanosec / 1e9,
                                }) as PlotDataPoint
                        ),
                    };
                } catch (e) {
                    let a = 5;
                }
            }
        );

        return data_arrays.map((d) => ({
            ...d,
            data: [
                ...new Map(d.data.map((item) => [item['time'], item])).values(),
            ],
        }));
    };

    return dashboardContext.configuration?.configured &&
        dashboardContext.hardware_configuration != undefined ? (
        <>
            {dashboardContext.configuration.motion_plots.map(
                (plot_configuration, plot_index) => (
                    <DataPlot
                        key={plot_index}
                        data={completeAxisData[plot_index]}
                        data_type={
                            AxisDataType[
                                plot_configuration.plot_type.toUpperCase() as keyof typeof AxisDataType
                            ]
                        }
                        data_parser={(data) =>
                            data
                                ? parseDataByType(
                                      data as PlotAxisData,
                                      plot_configuration.plot_type
                                  )
                                : []
                        }
                        // y_label={plot_configuration.plot_data_name}
                        plot_index={plot_index}
                        data_sources={plot_configuration.data_sources}
                        initial_data_acquired={checkDataAcquired(plot_index)}
                        // selected_sources={available_axes.filter((axis) =>
                        selected_sources={dashboardContext.hardware_configuration.axes.filter(
                            (axis) =>
                                dashboardContext.configuration.motion_plots[
                                    plot_index
                                ].data_sources.includes(axis.index)
                        )}
                        // available_sources={available_axes.filter(
                        available_sources={dashboardContext.hardware_configuration.axes.filter(
                            (axis) =>
                                !dashboardContext.configuration.motion_plots[
                                    plot_index
                                ].data_sources.includes(axis.index)
                        )}
                        base_plot_length={100}
                        selected_update_rate={plot_configuration.update_rate}
                        selected_plot_length={plot_configuration.length}
                        delete_plot_callback={(plot_index: number) =>
                            setDashboardContext({
                                payload: {
                                    plot_index: plot_index,
                                },
                                type: 'motion_plots/delete',
                            })
                        }
                        add_trace_callback={(axis_index: number) => {
                            setDashboardContext({
                                payload: {
                                    plot_index: plot_index,
                                    data_sources: [
                                        ...plot_configuration.data_sources,
                                        axis_index,
                                    ],
                                },
                                type: 'motion_plots/update',
                            });
                        }}
                        change_update_rate_callback={(update_rate: number) => {
                            setDashboardContext({
                                payload: {
                                    plot_index: plot_index,
                                    update_rate: update_rate,
                                },
                                type: 'motion_plots/update',
                            });
                        }}
                        change_plot_length_callback={(length: number) => {
                            initialDataAcquired.current = {
                                ...initialDataAcquired.current,
                                [plot_index]:
                                    dashboardContext.hardware_configuration.axes.reduce(
                                        (axes, axis) => ({
                                            ...axes,
                                            [axis.index]: false,
                                        }),
                                        {}
                                    ),
                            };
                            setDashboardContext({
                                payload: {
                                    plot_index: plot_index,
                                    length: length,
                                },
                                type: 'motion_plots/update',
                            });
                        }}
                    />
                )
            )}
            <div className="flex flex-row w-full justify-between p-2">
                <R2Button
                    text={'Add New Motion Plot'}
                    onClick={() =>
                        setDashboardContext({
                            payload: {
                                configuration: new PlotConfiguration({
                                    enabled: true,
                                    length: props.default_length,
                                    data_sources: [],
                                    update_rate: 5,
                                    plot_type: selectedPlotType,
                                }),
                            },
                            type: 'motion_plots/add',
                        })
                    }
                />
                <select
                    onChange={(e) => setSelectedPlotType(() => e.target.value)}
                    value={selectedPlotType}
                    className="text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                >
                    <option
                        id="position"
                        value="position"
                        className="text-black"
                    >
                        Position
                    </option>
                    <option
                        id="velocity"
                        value="velocity"
                        className="text-black"
                    >
                        Velocity
                    </option>
                </select>
            </div>
        </>
    ) : (
        <LoadingIndicator />
    );
}

export function MotionPlotContainer(): ReactElement {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    return dashboardContext.configuration?.configured ? (
        <>
            {/* <PlotContextProvider> */}
            <MotionPlots
                // available_axes={[0, 1, 2, 3]}
                available_axes={Object.keys(dashboardContext.axis_data).map(
                    (k) => parseInt(k)
                )}
                plot_types={['velocity', 'position']}
                default_update_rate={5}
                default_length={100}
            />
            {/* </PlotContextProvider> */}
        </>
    ) : (
        <LoadingIndicator />
    );
}
