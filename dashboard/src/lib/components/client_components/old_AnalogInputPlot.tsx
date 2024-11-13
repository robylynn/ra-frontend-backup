// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
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
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { Topic } from "roslib";
import { AnalogInputContext } from "@/lib/components/client_components/AnalogInputContext";
// import DashboardContext from "@/lib/models/dashboard_context";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import {
  ROSIOStateInterface,
  DatabaseROSIOStateArray,
} from "@/lib/models/database_models";
import { R2Button } from "@/lib/components/client_components/ClickButton";
import {
  DataSource,
  IOPointType,
  NextAPIResponseInterface,
  PlotConfiguration,
} from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";
import { strokeColor } from "@/lib/utils/chartColorPicker";

interface AnalogInputDataPoint {
  time: number;
  [key: number]: number;
}

// const dateFormatter = (timestamp: number) => {
//   let date = new Date(timestamp * 1000.0);
//   // let formatted_date = date.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
//   let formatted_date = date.toLocaleString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
//   return formatted_date;
// };

const Plot = (props: {
  data: Array<AnalogInputDataPoint>;
  data_sources: Array<number>;
  y_label?: string;
  // stroke_color?: string
}) => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            scale={"linear"}
            dataKey="time"
            name={"Time"}
            tickFormatter={plotDateFormatter}
            tickCount={2}
            // interval={"equidistantPreserveStart"}
          />
          <YAxis
            label={{ value: props.y_label ?? "Input Value", angle: -90 }}
          />
          <Tooltip />
          {props.data_sources.map((s) => (
            <Line
              type="monotone"
              dataKey={s}
              // stroke={props.stroke_color ?? "#8884d8"}
              stroke={`#${strokeColor(s)}`}
              isAnimationActive={false}
              animationBegin={0}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          ))}
          {/* <Line
            type="monotone"
            dataKey={0}
            stroke="#8884d8"
            isAnimationActive={false}
            animationBegin={0}
            animationDuration={500}
            animationEasing="ease-in-out"
          /> */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PlotContainer = (props: {
  data: Array<AnalogInputDataPoint>;
  data_name: string;
  data_sources: Array<number>;
  y_label?: string;
  plot_index: number;
}) => {
  const { dashboardContext, setDashboardContext } =
    useContext(DashboardContext);

  return (
    <div>
      <div className="flex flex-row justify-between">
        <h2>{`${props.data_name}`}</h2>
        <R2Button
          text="Remove Plot"
          onClick={() => {
            setDashboardContext({
              payload: {
                plot_index: props.plot_index,
              },
              type: "plots/delete",
            });
            // setContext((c) => {
            //   let new_config = c.configuration.copy();
            //   delete new_config.plots[props.plot_index];
            //   new_config.plots = new_config.plots.filter((plot) => plot);
            //   return {
            //     ...c,
            //     configuration: new_config,
            //   };
            // });
          }}
        />
      </div>
      <Plot
        data={props.data}
        data_sources={props.data_sources}
        y_label={props.y_label}
      />
    </div>
  );
};

const AnalogInputPlot = (props: { length: number }) => {
  // const { inputs } = useContext(AnalogInputContext);
  const { IOPoints } = useContext(IOPointContext);
  const { dashboardContext, setDashboardContext } =
    useContext(DashboardContext);
  const [selectedPlot, setSelectedPlot] = useState<string>();
  const [analogInData, setAnalogInData] = useState<Array<AnalogInputDataPoint>>(
    []
  );

  // const analog_in_subscription = useRef<Topic | null>();
  const initial_data_acquired = useRef<boolean>();

  // const filter_plot_data = (
  //   input_data: Array<AnalogInputDataPoint>,
  //   channel: number
  // ): Array<AnalogInputDataPoint> => {
  //   let filtered_data: Array<AnalogInputDataPoint> = input_data.map(
  //     (data_point, index) => ({
  //       time: data_point.time,
  //       [channel]: data_point[channel],
  //     })
  //   );
  //   return filtered_data;
  // };

  const save_configuration = async () => {
    let res: NextAPIResponseInterface = await fetch(
      "api/backend/ui/configuration",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(dashboardContext.configuration),
      }
    ).then((res) => res.json());
    console.log("POST response: " + JSON.stringify(res.data));
  };

  useEffect(() => {
    const get_initial_data = async () => {
      await timeoutFetch<Array<ROSIOStateInterface>>(
        `/api/backend/historian/io_data?number_of_points=${props.length}`,
        5000
      )
        .then((data) => {
          if (data) {
            let data_documents = new DatabaseROSIOStateArray(data);
            console.log("Got initial data");
            setAnalogInData((prevData) => {
              data_documents.documents.forEach((d) => {
                let time = d.time_sec + d.time_nsec / 1e9;

                let data_point: AnalogInputDataPoint = {
                  time: time,
                };

                for (const key in d.values) {
                  data_point[parseInt(key)] = d.values[key];
                }

                prevData.unshift(data_point);
              });
              initial_data_acquired.current = true;
              return prevData;
            });
          }
        })
        .catch((e) => {
          console.error(`Error acquiring initial plot data: ${e}`);
          initial_data_acquired.current = true;
        });
    };
    get_initial_data();
  }, []);

  useEffect(() => {
    // console.log(dashboardContext.analog_in_data)
    if (dashboardContext.analog_in_data) {
      setAnalogInData((prevData) => {
        let time =
          (dashboardContext.analog_in_data as any).stamp.sec +
          (dashboardContext.analog_in_data as any).stamp.nanosec / 1e9;

        let data_point: AnalogInputDataPoint = {
          time: time,
        };

        (dashboardContext.analog_in_data as any).values.forEach((v, i) => {
          data_point[i] = v;
        });

        if (initial_data_acquired.current == true) {
          prevData.push(data_point);
          prevData = prevData.reverse().slice(0, props.length).reverse();
        }

        return prevData;
      });
    }
  }, [dashboardContext.analog_in_data]);

  const configured_IO_points = IOPoints.getConfiguredIOPoints(
    IOPointType.ANALOG_INPUT
  );

  useEffect(() => {
    // Assign default selected plot so it isn't undefined
    if (!selectedPlot && configured_IO_points.length)
      setSelectedPlot(configured_IO_points[0].channel.toString());
  }, [configured_IO_points.length]);

  const handleAddPlot = () => {
    setDashboardContext({
      payload: {
        configuration: new PlotConfiguration({
          enabled: true,
          data_length: 100,
          data_sources: [selectedPlot.toString()],
        }),
      },
      type: "plots/add",
    });
    
    // let config = dashboardContext.configuration.copy();
    // config.plots.push(
    //   new PlotConfiguration({
    //     enabled: true,
    //     data_length: 100,
    //     data_sources: [selectedPlot.toString()],
    //   })
    // );

    // setContext((c) => ({ ...c, configuration: config }));
  };

  // return <></>
  return analogInData.length == 0 ? (
    <LoadingIndicator />
  ) : (
    <div>
      <div key={"header"} className="flex flex-col">
        <div className="flex flex-row justify-between">
          <select
            className="w-[40%]"
            value={selectedPlot}
            onChange={(e) => setSelectedPlot(e.target.value)}
            disabled={configured_IO_points.length <= 1}
          >
            {
              // IOPoints[IOPointType.ANALOG_INPUT].map((input, index) => {
              // IOPoints.getIOPoints(IOPointType.ANALOG_INPUT)
              //   .filter((p) => p.configured)
              configured_IO_points.map((input, index) => {
                const label =
                  input.label != ""
                    ? `${input.label} (Input ${input.channel})`
                    : `Input ${input.channel}`;
                // return <option key={input.channel?.toString()} value={input.channel}>{label}</option>
                return (
                  <option key={index} value={input.channel}>
                    {label}
                  </option>
                );
              })
            }
          </select>
          <R2Button
            text="Add Plot"
            className="w-[40%]"
            onClick={() => {
              handleAddPlot();
              // let plots = dashboardContext.configuration.plots;
              // plots.push(
              //   new PlotConfiguration({
              //     enabled: true,
              //     data_sources: [selectedPlot.toString()],
              //   })
              // );
              // setContext((c) => {
              //   c.configuration.plots = plots;
              //   return c;
              // });
            }}
          />
        </div>
        <R2Button
          text="Save Configuration"
          onClick={() => {
            save_configuration();
          }}
        />
      </div>
      <div key={"plots"}>
        {dashboardContext.configuration.plots.map(
          (plot_configuration, plot_index) => {
            // <div>
            let point = IOPoints.getIOPoints(IOPointType.ANALOG_INPUT)?.[
              parseInt(plot_configuration.data_sources[0])
            ];
            if (point) {
              let point_label = point?.label;
              let data_name =
                point_label ??
                `Analog Input ${plot_configuration.data_sources[0]}`;

              let y_label =
                point?.measurement_unit != "" ? point.measurement_unit : null;
              return (
                <PlotContainer
                  key={plot_index.toString()}
                  data_name={data_name}
                  data_sources={[parseInt(plot_configuration.data_sources[0])]}
                  // stroke_color={strokeColor(parseInt(plot_configuration.data_sources[0]))}
                  // inputs?.[plot_configuration.data_sources[0]].label == "" ? `Analog Input ${plot_configuration.data_sources[0]}` : inputs?.[plot_configuration.data_sources[0]].label
                  // IOPoints.getIOPoints(IOPointType.ANALOG_INPUT)?.[]
                  // {let data_label = 5}
                  // IOPoints.getIOPoints(IOPointType.ANALOG_INPUT)?.[plot_configuration.data_sources[0]]?.label == ""
                  //   // plot_configuration.data_sources[0]
                  //   // label == ""
                  //   ? `Analog Input ${plot_configuration.data_sources[0]}`
                  //   : IOPoints[IOPointType.ANALOG_INPUT]?.[
                  //       plot_configuration.data_sources[0]
                  //     ]?.label

                  data={analogInData}
                  // data={filter_plot_data(
                  //   analogInData,
                  //   parseInt(plot_configuration.data_sources[0])
                  // )}
                  // y_label={inputs?.[plot_configuration.data_sources[0]].measurement_unit == "" ? null : inputs?.[plot_configuration.data_sources[0]].measurement_unit}
                  y_label={y_label}
                  // y_label={
                  //   IOPoints[IOPointType.ANALOG_INPUT]?.[
                  //     plot_configuration.data_sources[0]
                  //   ]?.measurement_unit == ""
                  //     ? null
                  //     : IOPoints[IOPointType.ANALOG_INPUT]?.[
                  //         plot_configuration.data_sources[0]
                  //       ]?.measurement_unit
                  // }
                  plot_index={plot_index}
                />
              );
            }

            ///* </div> */}
          }
        )}
      </div>
    </div>
  );
};

export default AnalogInputPlot;
