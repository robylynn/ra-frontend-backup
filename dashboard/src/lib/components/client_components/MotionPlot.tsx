"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
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
// import { Topic } from "roslib";
import DashboardContext from "@/lib/models/dashboard_context";
// import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import WaitingIndicator from "@/lib/components/server_components/waiting_indicator";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";

const MotionPlot = (props: {title: string, data_key: "velocity" | "position", unit: string, axes: Array<number>, y_axis_transformation: (value: number) => number}) => {
  const { dashboardContext } = useContext(DashboardContext);

  interface axisTimeDataInterface {
    time: number;
  }

  const timeData = () => {
    let x_axis_data: Array<axisTimeDataInterface> = [];
    dashboardContext.axis_data?.[0]?.forEach((p, i) => {
      let data_point: axisTimeDataInterface = {
        time: p.stamp.sec + p.stamp.nanosec / 1e9,
      };
      x_axis_data.push(data_point);
    });

    return x_axis_data;
  };

  interface axisDataInterface {
    time: number,
    postiion: number,
    velocity: number
  }

  let axisData: Array<Array<axisDataInterface>> = [];
  if (dashboardContext.axis_data) {
    axisData = Object.keys(dashboardContext.axis_data).filter((k) => k in props.axes).map((axis_index) =>
      dashboardContext.axis_data[axis_index].map((p) => ({
        time: p.stamp.sec + p.stamp.nanosec / 1e9,
        [props.data_key]: props.y_axis_transformation(p[props.data_key])
        // velocity: p.velocity,
        // position: p.position,
      }))
    );
  }

  const tailwind_colors: Array<string> = [
    "DC2626",
    "EA580C",
    "D97706",
    "C026D3",
    "9333EA",
    "CA8A04",
    "65A30D",
    "16A34A",
    "059669",
    "2563EB",
    "9333EA",
    "E11D48",
    "0284C7",
  ];

  const strokeColor = (line_index: number): string => {
    return tailwind_colors[line_index % tailwind_colors.length];
  };

  return (
    <div>
      {axisData.length ? (
        <>
          <h2>{`${props.title} (${props.unit})`}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis xAxisId="0" dataKey="time" tickFormatter={plotDateFormatter}/>
              <YAxis label={{ value: props.unit ?? "", angle: -90 }}/>
              <Tooltip />
              <Legend />
              {axisData.map((v, i) => (
                <Line
                  type="monotone"
                  name={`Axis ${i}`}
                  dataKey={props.data_key}
                  data={v}
                  stroke={`#${strokeColor(i)}`}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          <WaitingIndicator text="WAITING FOR DATA" />
        </>
      )}
    </div>
  );
};

export default MotionPlot;
