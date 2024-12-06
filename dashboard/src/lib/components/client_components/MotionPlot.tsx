"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import WaitingIndicator from "@/lib/components/server_components/waiting_indicator";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";
import { strokeColor } from "@/lib/utils/chartColorPicker";
import { AxisData } from "@/lib/models/ros_models";
import { AxisTimeDataInterface } from "@/lib/models/plotting_models";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";

export const MotionPlot = (props: {
  plot_key: string;
  time_data: Array<AxisTimeDataInterface>;
  plot_data: Record<number, Array<AxisData>>;
  title: string;
  data_key: string;
  unit: string;
  axes: Array<number>;
  base_length: number;
  selected_length: number;
  selected_update_rate: number;
  y_axis_transformation: (value: number) => number;
  plot_length_setter: (plot_key: string, plot_length: number) => void;
  plot_update_rate_setter: (plot_key: string, update_rate_secs: number) => void;
}) => {
  const [activeSeries, setActiveSeries] = useState<Array<number>>(props.axes);
  const handleLegendClick = (axis_index: number) => {
    if (activeSeries.includes(axis_index)) {
      setActiveSeries(
        activeSeries.filter((displayed_axis) => displayed_axis !== axis_index)
      );
    } else {
      setActiveSeries((s) => [...s, axis_index]);
    }
  };

  return (
    <div>
      {Object.keys(props.plot_data)
        .map((axis_index) => props.plot_data[axis_index].length)
        .some((L) => L > 0) ? (
        <>
          <div className="flex flex-row justify-between">
            <h2>{`${props.title} (${props.unit})`}</h2>
            <select
              onChange={(e) => {
                props.plot_length_setter(
                  props.plot_key,
                  parseInt(e.target.value)
                );
              }}
              value={props.selected_length}
            >
              {[
                props.base_length,
                props.base_length * 2,
                props.base_length * 10,
                props.base_length * 50,
              ]
                .sort((a, b) => (a > b ? a : b))
                .map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
            </select>
            <select
              onChange={(e) => {
                props.plot_update_rate_setter(
                  props.plot_key,
                  parseInt(e.target.value)
                );
              }}
              value={props.selected_update_rate}
            >
              {[1, 5, 10].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}
                </option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={props.time_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                xAxisId="0"
                dataKey="time"
                tickFormatter={plotDateFormatter}
              />
              <YAxis label={{ value: props.unit ?? "", angle: -90 }} />
              <Tooltip />
              <Legend
                onClick={(props) =>
                  handleLegendClick(
                    parseInt((props.payload as any).id as string)
                  )
                }
              />
              {Object.keys(props.plot_data).map((axis_key, axis_index) => (
                <Line
                  id={axis_index.toString()}
                  key={axis_index.toString()}
                  hide={!activeSeries.includes(axis_index)}
                  type="monotone"
                  name={`Axis ${axis_index}`}
                  dataKey={props.data_key}
                  // dataKey={axis_index}
                  data={props.plot_data[axis_key]}
                  stroke={`#${strokeColor(axis_index)}`}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <WaitingIndicator text="WAITING FOR DATA" />
          <LoadingIndicator text="WAITING FOR DATA" />
        </>
      )}
    </div>
  );
};

export default MotionPlot;
