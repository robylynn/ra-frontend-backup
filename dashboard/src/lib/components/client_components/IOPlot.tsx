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
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import {
  ROSIOStateInterface,
  DatabaseROSIOStateArray,
} from "@/lib/models/database_models";
import { R2Button } from "@/lib/components/client_components/ClickButton";
import {
  DataSource,
  IOPointConfiguration,
  IOPointType,
  NextAPIResponseInterface,
  PlotConfiguration,
} from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";
import { strokeColor } from "@/lib/utils/chartColorPicker";

interface IODataPoint {
  time: number;
  [key: number]: number;
}

// const Plot = (props: {
//   data: Array<IODataPoint>;
//   data_sources: Array<number>;
//   y_label?: string;
//   // stroke_color?: string
// }) => {
//   return (
//     <div>
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={props.data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             scale={"linear"}
//             dataKey="time"
//             name={"Time"}
//             tickFormatter={plotDateFormatter}
//             tickCount={2}
//             // interval={"equidistantPreserveStart"}
//           />
//           <YAxis
//             label={{ value: props.y_label ?? "Input Value", angle: -90 }}
//           />
//           <Tooltip />
//           {props.data_sources.map((s) => (
//             <Line
//               type="monotone"
//               dataKey={s}
//               // stroke={props.stroke_color ?? "#8884d8"}
//               stroke={`#${strokeColor(s)}`}
//               isAnimationActive={false}
//               animationBegin={0}
//               animationDuration={500}
//               animationEasing="ease-in-out"
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

const PlotContainer = (props: {
  data: Array<IODataPoint>;
  data_name: string;
  data_sources: Array<number>;
  y_label?: string;
  plot_index: number;
}) => {
  const { dashboardContext, setDashboardContext } = useContext(DashboardContext);

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
      {/* <Plot data={props.data} data_sources={props.data_sources} y_label={props.y_label} /> */}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const IOPlot = (props: { length: number, point_type: IOPointType, point_channels: Array<number> }) => {
  // const { inputs } = useContext(AnalogInputContext);
  const { IOPoints } = useContext(IOPointContext);
  const { dashboardContext, setDashboardContext } = useContext(DashboardContext);
  const [selectedPlot, setSelectedPlot] = useState<string>();
  const [ioData, setIOData] = useState<Array<IODataPoint>>(
    []
  );

  const initial_data_acquired = useRef<boolean>();

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

  const data_endpoint = (point_type: IOPointType) : string => {
    switch (point_type) {
      case (IOPointType.DIGITAL_INPUT): {
        return "digital_in"
      }
      case (IOPointType.ANALOG_INPUT): {
        return "analog_in"
      }
    }
  }
  
  useEffect(() => {
    const get_initial_data = async () => {
      await timeoutFetch<Array<ROSIOStateInterface>>(
        `/api/backend/historian/${data_endpoint(props.point_type)}?number_of_points=${props.length}`,
        5000
      )
        .then((data) => {
          if (data) {
            let data_documents = new DatabaseROSIOStateArray(data);
            console.log("Got initial data");
            setIOData((prevData) => {
              const initial_chart_data = data_documents.documents.map((d) => {
                // let time = d.time_sec + d.time_nsec / 1e9;

                if (props.point_type == IOPointType.DIGITAL_INPUT) {
                  let a = 5;
                }

                let time = d.stamp.sec + d.stamp.nanosec / 1e9;

                let data_point: IODataPoint = {
                  time: time,
                };

                for (const key in d.values) {
                  if (props.point_type == IOPointType.ANALOG_INPUT || props.point_type == IOPointType.ANALOG_OUTPUT)
                    data_point[parseInt(key)] = d.values[key];
                  else
                    data_point[parseInt(key)] = d.values[key] ? 1 : 0;
                }

                return data_point;
              });
              initial_data_acquired.current = true;
              return initial_chart_data.reverse();
            });
          }
        })
        .catch((e) => {
          console.error(`Error acquiring initial plot data: ${e}`);
          initial_data_acquired.current = false;
        });
    };
    
    if (!initial_data_acquired.current)
      get_initial_data();

  }, [dashboardContext.heartbeat_counter]);

  if (props.point_type == IOPointType.DIGITAL_INPUT) {
    let a =5;
  }

  useEffect(() => {
    // console.log(dashboardContext.analog_in_data)
    const latest_point = dashboardContext.getIOSState(props.point_type);
    if (latest_point) {
    // if (dashboardContext.analog_in_data) {
      setIOData((prevData) => {
        // const latest_point = 
        let time =
          (latest_point as any).stamp.sec +
          (latest_point as any).stamp.nanosec / 1e9;

        let data_point: IODataPoint = {
          time: time,
        };

        (latest_point as any).values.forEach((v, i) => {
          if (props.point_type == IOPointType.ANALOG_INPUT || props.point_type == IOPointType.ANALOG_OUTPUT)
            data_point[i] = v;
          else
            data_point[i] = v ? 1 : 0;
        });

        if (initial_data_acquired.current == true) {
          return [...prevData.slice(-(props.length - 1)), data_point]
          // prevData.push(data_point);
          // prevData = prevData.reverse().slice(0, props.length).reverse();
        }

        return prevData;
      });
    }
  // }, [dashboardContext.analog_in_data]);
  }, [dashboardContext.getIOSState(props.point_type)]);

  const configured_IO_points = IOPoints.getConfiguredIOPoints(
    props.point_type
  );

  useEffect(() => {
    // Assign default selected plot so it isn't undefined
    if (!selectedPlot && configured_IO_points.length)
      setSelectedPlot(configured_IO_points[0].channel.toString());
  }, [configured_IO_points.length]);

  const handleAddPlot = () => {
    let config = dashboardContext.configuration.copy();
    config.plots.push(
      new PlotConfiguration({
        enabled: true,
        data_length: 100,
        data_sources: [selectedPlot.toString()],
      })
    );

    // setContext((c) => ({ ...c, configuration: config }));
    setDashboardContext({
      payload: {
        configuration: new PlotConfiguration({
          enabled: true,
          data_length: props.length,
          data_sources: [selectedPlot.toString()],
        }),
      },
      type: "plots/add",
    });
    
  };

  const point_type_name = (point_type: IOPointType) => {
    switch (point_type) {
      case IOPointType.ANALOG_INPUT: {
        return "Analog Input";
      }
      case IOPointType.DIGITAL_INPUT: {
        return "Analog Input";
      }
      default: {
        return "Unknown Type";
      }
    }
  }

  // return <></>
  return ioData.length == 0 ? (
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
            let point = IOPoints.getIOPoints(props.point_type)?.[
              parseInt(plot_configuration.data_sources[0])
            ];
            if (point) {
              let point_label = point?.label;
              let data_name =
                point_label ??
                `${point_type_name(props.point_type)} ${plot_configuration.data_sources[0]}`;

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

                  data={ioData}
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

export default IOPlot;
