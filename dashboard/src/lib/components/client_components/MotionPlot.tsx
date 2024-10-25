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
// import DashboardContext from "@/lib/models/dashboard_context";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
// import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import WaitingIndicator from "@/lib/components/server_components/waiting_indicator";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";
import { strokeColor } from "@/lib/utils/chartColorPicker";
import { AxisData } from "@/lib/models/ros_models";

const MotionPlot = (props: {
  title: string;
  data_key: "velocity" | "position";
  unit: string;
  axes: Array<number>;
  length: number;
  y_axis_transformation: (value: number) => number;
}) => {
  const { dashboardContext } = useContext(DashboardContext);

  interface AxisTimeDataInterface {
    time: number;
  }

  // interface axisDataInterface {
  //   time: number;
  //   postiion: number;
  //   velocity: number;
  // }

  const [timeData, setTimeData] = useState<Array<AxisTimeDataInterface>>([]);
  const [axisData, setAxisData] = useState<Record<number, Array<AxisData>>>({});

  useEffect(() => {
    const last_time = timeData?.slice(-1)[0]?.time;
    const new_time =
      dashboardContext.axis_data[0]?.stamp.sec +
      dashboardContext.axis_data[0]?.stamp.nanosec / 1e9;

    if (new_time) {
      if (last_time) {
        if (new_time != last_time) {
          setTimeData((d) =>
            [
              ...d,
              {
                time: new_time,
              },
            ].slice(-props.length)
          );
        }
      } else {
        setTimeData((d) =>
          [
            ...d,
            {
              time: new_time,
            },
          ].slice(-props.length)
        );
      }
    } else {
      // setTimeData((d) =>
      //   [
      //     ...d,
      //     {
      //       time: new_time,
      //     },
      //   ].slice(-props.length)
      // );
    }
    // if (last_time && (new_time != last_time)) {
    //   setTimeData((d) => [
    //     ...d,
    //     {
    //       time: new_time
    //     },
    //   ].slice(-props.length));
    // }

    // if (last_time) {

    //   if (last_time.time == )
    // }
    // setTimeData((d) => [
    //   ...d,
    //   {
    //     time:
    //       dashboardContext.axis_data?.[0]?.stamp.sec +
    //       dashboardContext.axis_data?.[0]?.stamp.nanosec / 1e9,
    //   },
    // ].slice(-props.length));

    Object.keys(dashboardContext.axis_data).forEach((k, i) => {
      const axis_index = parseInt(k);
      // if (axisData) {

      // }
      // const last_axis_data = axisData;
      const last_entry = axisData[axis_index]?.slice(-1)?.[0];
      if (
        last_entry // &&
        // dashboardContext.axis_data[axis_index].stamp.sec !=
        //   last_entry.stamp.sec &&
        // dashboardContext.axis_data[axis_index].stamp.nanosec !=
        //   last_entry.stamp.nanosec
      ) {
        // This is a new data point
        // setAxisData((d) => {
        //   return { 1: axisData[1] };
        // });

        // setAxisData((d) =>
        //   // return
        //   ({
        //     ...d,
        //     [axis_index]: [
        //       ...d[axis_index],
        //       dashboardContext.axis_data[axis_index],
        //     ].slice(-50),
        //   })
        // );
        const last_data_time = last_entry.stamp.sec + last_entry.stamp.nanosec / 1e9;
        const current_data_time = dashboardContext.axis_data[axis_index].stamp.sec + dashboardContext.axis_data[axis_index].stamp.nanosec / 1e9;
        if (
          last_data_time != current_data_time
        ) {
          setAxisData((d) =>
            // return
            ({
              ...d,
              [axis_index]: [
                ...d[axis_index],
                dashboardContext.axis_data[axis_index],
              ].slice(-props.length),
            })
          );
        }
      } else {
        setAxisData((d) => ({
          ...d,
          [axis_index]: [dashboardContext.axis_data[axis_index]],
        }));
      }
    });
    // if (dashboardContext.axis_data)
    // setAxisData((d) => {

    // })
  }, [dashboardContext.axis_data]);

  // const timeDataOld = () => {
  //   let x_axis_data: Array<AxisTimeDataInterface> = [];
  //   dashboardContext.axis_data?.[0]?.forEach((p, i) => {
  //     let data_point: AxisTimeDataInterface = {
  //       time: p.stamp.sec + p.stamp.nanosec / 1e9,
  //     };
  //     x_axis_data.push(data_point);
  //   });

  //   return x_axis_data;
  // };

  // let axisData: Array<Array<axisDataInterface>> = [];
  // if (dashboardContext.axis_data) {
  //   axisData = Object.keys(dashboardContext.axis_data)
  //     .filter((k) => k in props.axes)
  //     .map((axis_index) =>
  //       dashboardContext.axis_data[axis_index].map((p) => ({
  //         time: p.stamp.sec + p.stamp.nanosec / 1e9,
  //         [props.data_key]: props.y_axis_transformation(p[props.data_key]),
  //         // velocity: p.velocity,
  //         // position: p.position,
  //       }))
  //     );
  // }

  // setContext((c) => {
  //   const data_point: AxisData = {
  //     stamp: message.stamp,
  //     position: message.position,
  //     velocity: message.velocity,
  //     axis_index: axisIndex,
  //   };
  //   let newAxisData;
  //   if (!c.axis_data || !(axisIndex in c.axis_data)) {
  //     newAxisData = {
  //       ...c.axis_data,
  //       [axisIndex]: [data_point].slice(-50),
  //     };
  //   } else {
  //     newAxisData = {
  //       ...c.axis_data,
  //       [axisIndex]: [...c.axis_data?.[axisIndex], data_point].slice(-50),
  //     };
  //   }
  //   return { ...c, axis_data: newAxisData };
  // });

  // const tailwind_colors: Array<string> = [
  //   "DC2626",
  //   "EA580C",
  //   "D97706",
  //   "C026D3",
  //   "9333EA",
  //   "CA8A04",
  //   "65A30D",
  //   "16A34A",
  //   "059669",
  //   "2563EB",
  //   "9333EA",
  //   "E11D48",
  //   "0284C7",
  // ];

  // const strokeColor = (line_index: number): string => {
  //   return tailwind_colors[line_index % tailwind_colors.length];
  // };

  return (
    <div>
      {Object.keys(axisData).length ? (
        <>
          <h2>{`${props.title} (${props.unit})`}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                xAxisId="0"
                dataKey="time"
                tickFormatter={plotDateFormatter}
              />
              <YAxis label={{ value: props.unit ?? "", angle: -90 }} />
              <Tooltip />
              <Legend />
              {Object.keys(axisData).map((v, i) => (
                <Line
                  key={i.toString()}
                  type="monotone"
                  name={`Axis ${i}`}
                  dataKey={props.data_key}
                  data={axisData[v]}
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
