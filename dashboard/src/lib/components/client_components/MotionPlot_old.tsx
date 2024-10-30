"use client";

import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
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
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import WaitingIndicator from "@/lib/components/server_components/waiting_indicator";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";
import { strokeColor } from "@/lib/utils/chartColorPicker";
import { AxisData } from "@/lib/models/ros_models";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import {
  DatabaseROSAxisStateArray,
  ROSAxisStateInterface,
} from "@/lib/models/database_models";

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

  const [timeData, setTimeData] = useState<Array<AxisTimeDataInterface>>([]);
  const [axisData, setAxisData] = useState<Record<number, Array<AxisData>>>({});
  const [plottedTimeData, setPlottedTimeData] = useState<
    Array<AxisTimeDataInterface>
  >([]);
  const [plottedAxisData, setPlottedAxisData] = useState<
    Record<number, Array<AxisData>>
  >({});
  const [plotLength, setPlotLength] = useState<number>(props.length);
  const initial_data_acquired = useRef<Record<number, boolean>>({});

  const memoizedPlotTimeData = useMemo(
    () => plottedTimeData,
    [plottedTimeData]
  );

  const memoizedPlotAxisData = useMemo(
    () => plottedAxisData,
    [plottedAxisData]
  );

  const memoizedTestValue = useMemo(() => plotLength, [plottedTimeData]);

  useEffect(() => {
    const get_initial_data = async (axis_index: number) => {
      await timeoutFetch<Array<ROSAxisStateInterface>>(
        `/api/backend/historian/axis/${axis_index}?number_of_points=${plotLength}`,
        5000
      )
        .then((data) => {
          if (data) {
            let data_documents = new DatabaseROSAxisStateArray(data);
            console.log("Got initial data");

            if (axis_index == 0) {
              setTimeData(() =>
                data_documents.documents
                  .map((d) => ({
                    time: d.stamp.sec + d.stamp.nanosec / 1e9,
                  }))
                  .reverse()
              );
            }

            setAxisData((d) => ({
              ...d,
              [axis_index]: data_documents.documents
                .map((d) => ({
                  stamp: d.stamp,
                  axis_index: axis_index,
                  position: d.position,
                  velocity: d.velocity,
                }))
                .reverse(),
            }));

            // initial_data_acquired[axis_index].current = true;
            initial_data_acquired.current = {
              ...initial_data_acquired.current,
              [axis_index]: true,
            };
          }
        })
        .catch((e) => {
          console.error(`Error acquiring initial plot data: ${e}`);
          // initial_data_acquired[axis_index].current = false;
          initial_data_acquired.current = {
            ...initial_data_acquired.current,
            [axis_index]: false,
          };
        });
    };

    props.axes.forEach((i) => {
      if (!initial_data_acquired.current?.[i]) get_initial_data(i);
      console.log(`Acquiring data for axis ${i}`);
    });
    // if (!initial_data_acquired.current) get_initial_data();
    // }, [dashboardContext.heartbeat_counter]);
  }, [plotLength]);

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
            ].slice(-plotLength)
          );
        }
      } else {
        setTimeData((d) =>
          [
            ...d,
            {
              time: new_time,
            },
          ].slice(-plotLength)
        );
      }
    }

    Object.keys(dashboardContext.axis_data).forEach((k, i) => {
      const axis_index = parseInt(k);
      if (!props.axes.includes(axis_index)) {
        return;
      }
      // if (axisData) {

      // }
      // const last_axis_data = axisData;
      const last_entry = axisData[axis_index]?.slice(-1)?.[0];
      if (last_entry) {
        const last_data_time =
          last_entry.stamp.sec + last_entry.stamp.nanosec / 1e9;
        const current_data_time =
          dashboardContext.axis_data[axis_index].stamp.sec +
          dashboardContext.axis_data[axis_index].stamp.nanosec / 1e9;
        if (last_data_time != current_data_time) {
          setAxisData((d) =>
            // return
            ({
              ...d,
              [axis_index]: [
                ...d[axis_index],
                dashboardContext.axis_data[axis_index],
              ].slice(-plotLength),
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

  const [updateCounter, setUpdateCounter] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUpdateCounter((counter) => counter + 1);
    }, 5 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setPlottedTimeData(() => timeData);
    setPlottedAxisData(() => axisData);
  }, [updateCounter]);

  const Plots = (props: {
    time_data: Array<AxisTimeDataInterface>;
    plot_data: Record<number, Array<AxisData>>;
    title: string;
    unit: string;
    initial_length: number;
    length: number;
    selectChangeHandler: (e) => void;
  }) => {
    return Object.keys(props.plot_data).length ? (
      <>
        <div className="flex flex-row justify-between">
          <h2>{`${props.title} (${props.unit})`}</h2>
          <select
            onChange={props.selectChangeHandler}
            // onChange={(e) => {
            //   initial_data_acquired.current = {};
            //   setPlotLength(parseInt(e.target.value))
            // }}
            value={props.length}
          >
            {[
              props.initial_length,
              props.initial_length * 2,
              props.initial_length * 10,
              props.initial_length * 50,
            ]
              .sort((a, b) => (a > b ? a : b))
              .map((p, i) => (
                <option key={i} value={p}>
                  {p}
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
              // tickFormatter={plotDateFormatter}
            />
            <YAxis label={{ value: props.unit ?? "", angle: -90 }} />
            <Tooltip />
            <Legend />
            {Object.keys(props.plot_data).map((v, i) => (
              <Line
                key={i.toString()}
                type="monotone"
                name={`Axis ${i}`}
                dataKey={"velocity"}
                data={props.plot_data[v]}
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
    );
  };

  const test_plot_data = {
    0: [
      {
        stamp: {
          sec: 10,
          nanosec: 10,
        },
        axis_index: 0,
        position: 10,
        velocity: 10,
      },
      {
        stamp: {
          sec: 10,
          nanosec: 10,
        },
        axis_index: 0,
        position: 11,
        velocity: 11,
      },
    ],
    1: [
      {
        stamp: {
          sec: 10,
          nanosec: 10,
        },
        axis_index: 1,
        position: 10,
        velocity: 10,
      },
      {
        stamp: {
          sec: 10,
          nanosec: 10,
        },
        axis_index: 1,
        position: 11,
        velocity: 11,
      },
    ],
  };
  // [
  //   {
  //     stamp: {
  //       sec: 10,
  //       nanosec: 10
  //     },
  //     axis_index: 0,
  //     position: 10,
  //     velocity: 10
  //   },
  //   {
  //     stamp: {
  //       sec: 10,
  //       nanosec: 10
  //     },
  //     axis_index: 0,
  //     position: 11,
  //     velocity: 11
  //   }
  // ]

  const test_time_data = [
    {
      time: 1,
    },
    {
      time: 2,
    },
  ];

  const SimplePlot = (props: { time_data; plot_data }) => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={props.time_data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          xAxisId="0"
          dataKey="time"
          // tickFormatter={plotDateFormatter}
        />
        {/* <YAxis label={{ value: props.unit ?? "", angle: -90 }} /> */}
        <YAxis label={{ value: "unit", angle: -90 }} />
        <Tooltip />
        <Legend />
        <Line
          key={0}
          type="monotone"
          name={`Axis 0`}
          dataKey={"velocity"}
          data={props.plot_data[0]}
          stroke={`#ff0000`}
          isAnimationActive={false}
        />
        {/* {Object.keys(props.plot_data).map((v, i) => (
        <Line
          key={i.toString()}
          type="monotone"
          name={`Axis ${i}`}
          dataKey={"velocity"}
          data={props.plot_data[v]}
          stroke={`#${strokeColor(i)}`}
          isAnimationActive={false}
        />
      ))} */}
      </LineChart>
    </ResponsiveContainer>
  );

  const simpleMemoizedTimeData = useMemo(
    () => test_time_data,
    []
  )

  const simpleMemoizedPlotData = useMemo(
    () => test_plot_data,
    []
  )

  return (
    <div>
      <p>{memoizedTestValue}</p>
      <SimplePlot
        time_data={simpleMemoizedTimeData}
        plot_data={simpleMemoizedPlotData}
      />
      {/* <Plots
        // time_data={memoizedPlotTimeData}
        // plot_data={memoizedPlotAxisData}
        time_data={test_time_data}
        plot_data={test_plot_data}
        title={"test chart"}
        unit={"unit"}
        initial_length={100}
        length={100}
        selectChangeHandler={(e) => {}}
        // selectChangeHandler={(e) => {
        //   initial_data_acquired.current = {};
        //   setPlotLength(parseInt(e.target.value))
        // }}
      /> */}

      {/* {Object.keys(memoizedPlotAxisData).length ? (
        <>
          <div className="flex flex-row justify-between">
          <h2>{`${props.title} (${props.unit})`}</h2>
          <select
            onChange={(e) => {
              initial_data_acquired.current = {};
              setPlotLength(parseInt(e.target.value))
            }}
            value={plotLength}
          >
            {
              [props.length, props.length * 2, props.length * 10, props.length * 50].sort((a,b) => a > b ? a : b).map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))
            }
          </select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={memoizedPlotTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                xAxisId="0"
                dataKey="time"
                tickFormatter={plotDateFormatter}
              />
              <YAxis label={{ value: props.unit ?? "", angle: -90 }} />
              <Tooltip />
              <Legend />
              {Object.keys(memoizedPlotAxisData).map((v, i) => (
                <Line
                  key={i.toString()}
                  type="monotone"
                  name={`Axis ${i}`}
                  dataKey={props.data_key}
                  data={memoizedPlotAxisData[v]}
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
      )} */}
    </div>
  );
};

export default MotionPlot;
