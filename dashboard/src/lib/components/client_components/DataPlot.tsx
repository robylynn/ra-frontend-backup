'use client';

import { R2Button } from '@/lib/components/client_components/ClickButton';
import LoadingIndicator from '@/lib/components/server_components/loading_indicator';
import {
    AxisConfiguration,
    AxisDataType,
    IOPointConfiguration,
    IOPointType,
} from '@/lib/models/api_models';
import {
    PlotAxisData,
    PlotDataPoint,
    PlotInputData,
    PlotInputDataInterface,
} from '@/lib/models/plotting_models';
import { strokeColor } from '@/lib/utils/chartColorPicker';
import { plotDateFormatter } from '@/lib/utils/plotDateFormatter';
import { useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const DataPlot = (props: {
    data: Array<PlotDataPoint> | PlotAxisData;
    data_type: IOPointType | AxisDataType;
    // y_label?: string;
    data_parser: (data: Array<PlotDataPoint> | PlotAxisData) => PlotInputData;
    plot_index: number;
    data_sources: Array<number>;
    initial_data_acquired: boolean;
    selected_sources: Array<IOPointConfiguration> | Array<AxisConfiguration>;
    available_sources: Array<IOPointConfiguration> | Array<AxisConfiguration>;
    base_plot_length: number;
    selected_update_rate: number;
    selected_plot_length: number;
    delete_plot_callback: (plot_index: number) => void;
    add_trace_callback: (io_channel: number) => void;
    change_update_rate_callback: (update_rate: number) => void;
    change_plot_length_callback: (plot_length: number) => void;
}) => {
    const [plotUpdateCounter, setPlotUpdateCounter] = useState<number>(
        props.selected_update_rate
    );

    const plottedData = useMemo(
        () => props.data_parser(props.data),
        [plotUpdateCounter, props.initial_data_acquired]
    );
    const [selectedDataSource, setSelectedDataSource] = useState<number>(
        props.available_sources?.[0]?.identifier
    );
    const [activeSeries, setActiveSeries] = useState<Array<number>>(
        props.data_sources
    );

    useEffect(() => {
        setSelectedDataSource(() => props.available_sources?.[0]?.identifier);
    }, [JSON.stringify(props.available_sources)]);

    useEffect(() => {
        const intervalId = setInterval(
            () => {
                setPlotUpdateCounter((counter) => counter + 1);
            },
            props.selected_update_rate > 0
                ? props.selected_update_rate * 1000
                : 1000
        );
        return () => clearInterval(intervalId);
    }, [props.selected_update_rate]);

    const handleLegendClick = (data_source_index: number) => {
        if (activeSeries.includes(data_source_index)) {
            setActiveSeries(
                activeSeries.filter(
                    (displayed_data_source) =>
                        displayed_data_source !== data_source_index
                )
            );
        } else {
            setActiveSeries((s) => [...s, data_source_index]);
        }
    };

    const y_axis_label = (): string => {
        if (
            props.selected_sources.every(
                (s) => s instanceof IOPointConfiguration
            )
        ) {
            if (
                props.data_type == IOPointType.ANALOG_INPUT ||
                props.data_type == IOPointType.ANALOG_OUTPUT
            ) {
                const units = (
                    props.selected_sources as Array<IOPointConfiguration>
                )
                    .filter(
                        (io_channel) =>
                            io_channel.measurement_unit &&
                            io_channel.measurement_unit != ''
                    )
                    .map((io_channel) => io_channel.measurement_unit);
                if (units.some((unit) => unit)) {
                    const unit_string = units.join(' / ');
                    return unit_string;
                }

                return 'Unknown Units';
            } else {
                return 'State';
            }
        } else {
            // This is axis data
            if (props.data_type == AxisDataType.VELOCITY) {
                return 'Velocity (rev/s)';
            } else if (props.data_type == AxisDataType.POSITION) {
                return 'Position (rev)';
            }
        }

        return "Unknown";
    };

    const findDataEntry = (
        data_source_identifier: number
    ): PlotInputDataInterface | undefined => {
        for (const input_data of plottedData) {
            if (input_data.id == data_source_identifier) {
                return input_data;
            }
        }
        return undefined;
    };

    return (
        <div>
            <div className="flex flex-row justify-between py-2">
                <select
                    className="w-[40%]"
                    value={selectedDataSource}
                    onChange={(e) =>
                        setSelectedDataSource(parseInt(e.target.value))
                    }
                    disabled={props.available_sources.length < 1}
                >
                    {props.available_sources.map((source, index) => {
                        let label: string;
                        if (source instanceof IOPointConfiguration) {
                            const point_configuration =
                                source as IOPointConfiguration;
                            label =
                                point_configuration.label != ''
                                    ? `${point_configuration.label} (Input ${point_configuration.channel})`
                                    : `Input ${point_configuration.channel}`;
                        } else if (source instanceof AxisConfiguration) {
                            const axis_configuration =
                                source as AxisConfiguration;
                            label =
                                axis_configuration.label != ''
                                    ? `${axis_configuration.label} (Axis ${axis_configuration.index})`
                                    : `Axis ${axis_configuration.index}`;
                        }
                        return (
                            <option key={index} value={source.identifier}>
                                {label}
                            </option>
                        );
                    })}
                </select>

                <R2Button
                    text="Add Trace"
                    disabled={!props.available_sources.length}
                    onClick={() => {
                        setSelectedDataSource(
                            () => props.available_sources?.[0]?.identifier
                        );
                        setActiveSeries((s) => [...s, selectedDataSource]);
                        props.add_trace_callback(selectedDataSource);
                    }}
                />
                <div className="flex flex-col items-center">
                    <p className="text-r2-white">Update Rate</p>
                    <select
                        onChange={(e) =>
                            props.change_update_rate_callback(
                                parseInt(e.target.value)
                            )
                        }
                        value={props.selected_update_rate}
                    >
                        {[1, 5, 10]
                            .sort((a, b) => (a > b ? a : b))
                            .map((p, i) => (
                                <option key={i} value={p}>
                                    {p}
                                </option>
                            ))}
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-r2-white">Length</p>
                    <select
                        onChange={(e) =>
                            props.change_plot_length_callback(
                                parseInt(e.target.value)
                            )
                        }
                        value={props.selected_plot_length}
                    >
                        {[
                            props.base_plot_length,
                            props.base_plot_length * 2,
                            props.base_plot_length * 10,
                            props.base_plot_length * 50,
                        ]
                            .sort((a, b) => (a > b ? a : b))
                            .map((p, i) => (
                                <option key={i} value={p}>
                                    {p}
                                </option>
                            ))}
                    </select>
                </div>
                <R2Button
                    text="Remove Plot"
                    onClick={() => {
                        props.delete_plot_callback(props.plot_index);
                    }}
                />
            </div>
            <ResponsiveContainer width="100%" height={400}>
                {!props.initial_data_acquired ? (
                    <LoadingIndicator text="FETCHING DATA" />
                ) : (
                    <LineChart>
                        <CartesianGrid strokeDasharray="3 3" />

                        {props.data_sources.length ? (
                            <>
                                <XAxis
                                    scale={'linear'}
                                    dataKey="time"
                                    name={'Time'}
                                    tickFormatter={plotDateFormatter}
                                    tickCount={3}
                                    type="number"
                                    allowDuplicatedCategory={false}
                                    domain={['dataMin', 'dataMax']}
                                    // interval={"equidistantPreserveStart"}
                                />
                                <YAxis
                                    label={{
                                        value: y_axis_label(),
                                        angle: -90,
                                    }}
                                />
                            </>
                        ) : (
                            <></>
                        )}

                        <Legend
                            onClick={(props) =>
                                handleLegendClick(
                                    parseInt(
                                        (props.payload as any).id as string
                                    )
                                )
                            }
                        />
                        <Tooltip />
                        {props.data_sources
                            .sort((a, b) => (b > a ? -1 : 1))
                            .map((s) => {
                                // if (s != 0) return
                                const data_series = findDataEntry(s);
                                return (
                                    <Line
                                        data={data_series?.data}
                                        id={s.toString()}
                                        key={s}
                                        type="linear"
                                        dot={false}
                                        dataKey={s}
                                        name={data_series?.name}
                                        hide={!activeSeries.includes(s)}
                                        stroke={`#${strokeColor(s)}`}
                                        isAnimationActive={false}
                                        animationBegin={0}
                                        animationDuration={500}
                                        animationEasing="ease-in-out"
                                    />
                                );
                            })}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default DataPlot;
