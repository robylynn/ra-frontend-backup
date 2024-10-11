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
import DashboardContext from "@/lib/models/dashboard_context";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import { ROSAnalogIOStateInterface, DatabaseROSAnalogIOStateArray } from "@/lib/models/database_models";
import { R2Button } from "@/lib/components/client_components/ClickButton";
import { DataSource, IOPointType, NextAPIResponseInterface, PlotConfiguration } from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";

interface AnalogInputDataPoint {
  time: number;
  [key: number]: number;
}

const dateFormatter = (timestamp: number) => {
  let date = new Date(timestamp * 1000.0);
  // let formatted_date = date.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  let formatted_date = date.toLocaleString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return formatted_date;
};

const Plot = (props: { data: Array<AnalogInputDataPoint>, y_label?: string }) => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={dateFormatter} tickCount={2} interval={'equidistantPreserveStart'}/>
          <YAxis label={{value: props.y_label ?? "Input Value", angle: -90}}/>
          <Tooltip />
          <Line
            type="monotone"
            dataKey={0}
            stroke="#8884d8"
            isAnimationActive={false}
            animationBegin={0}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PlotContainer = (props: { data: Array<AnalogInputDataPoint>, data_name: string, y_label?: string, plot_index: number}) => {
  const { dashboardContext, setContext } = useContext(DashboardContext);

  return (
    <div>
      <div className="flex flex-row justify-between">
        <h2>{`${props.data_name}`}</h2>
        <R2Button
          text="Remove Plot"
          onClick={() => {
            setContext((c) => {
              delete c.configuration.plots[props.plot_index];
              c.configuration.plots = c.configuration.plots.filter(plot => plot)
              return c;
            })
          }}
        />
      </div>
      <Plot data={props.data} y_label={props.y_label} />
    </div>

  )
}

const AnalogInputPlot = (props: { length: number }) => {
  // const { inputs } = useContext(AnalogInputContext);
  const { IOPoints } = useContext(IOPointContext);
  const { dashboardContext, setContext } = useContext(DashboardContext);
  const [selectedPlot, setSelectedPlot] = useState<string>();
  const [analogInData, setAnalogInData] = useState<Array<AnalogInputDataPoint>>(
    []
  );
  
  const analog_in_subscription = useRef<Topic | null>();
  const initial_data_acquired = useRef<boolean>();

  const filter_plot_data = (input_data: Array<AnalogInputDataPoint>, channel: number): Array<AnalogInputDataPoint> => {
    let filtered_data: Array<AnalogInputDataPoint> = input_data.map((data_point, index) => (
      
      {time: data_point.time, [channel]: data_point[channel]}
    ));
    return filtered_data;
  }

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
  }

  useEffect(() => {
    const get_initial_data = async () => {
      await timeoutFetch<Array<ROSAnalogIOStateInterface>>(`/api/backend/historian/io_data?number_of_points=${props.length}`, 5000)
        .then((data) => {
          if (data) {
            let data_documents = new DatabaseROSAnalogIOStateArray(data);
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

                prevData.unshift(data_point)
              })
              initial_data_acquired.current = true;
              return prevData;
            })
          }
        })
        .catch((e) => {
          console.error(`Error acquiring initial plot data: ${e}`)
          initial_data_acquired.current = true;
        })
    };
    get_initial_data();
  }, [])

  useEffect(() => {
    const subscribeToAnalogInputs = () => {
      if (!analog_in_subscription.current) {
        if (dashboardContext.ra_ros_websocket) {
          analog_in_subscription.current = new Topic({
            ros: dashboardContext.ra_ros_websocket,
            name: `/gpio/analog_in_electrical_units`,
            messageType: "r2c_interfaces/AnalogIn",
          });

          analog_in_subscription.current.subscribe((message) => {
            setAnalogInData((prevData) => {
              let time =
                (message as any).stamp.sec +
                (message as any).stamp.nanosec / 1e9;

              let data_point: AnalogInputDataPoint = {
                time: time,
              };

              (message as any).values.forEach((v, i) => {
                data_point[i] = v;
              });

              if (initial_data_acquired.current == true) {
                prevData.push(data_point);
                prevData = prevData.reverse().slice(0, props.length).reverse();
              }
              
              return prevData;
            });
          });

          console.log(`Subscribed to /gpio/analog_in_electrical_units`);
        }
      }
    };

    subscribeToAnalogInputs();
    // Cleanup function to unsubscribe on component unmount
    return () => {
      if (analog_in_subscription.current)
        analog_in_subscription.current.unsubscribe();
      analog_in_subscription.current = null;
      console.log(`Unsubscribed from /gpio/analog_in_electrical_units`);
    };
  }, [dashboardContext.ra_ros_websocket]);

  // useEffect(() => {
  //   console.log(inputs)
  //   setSelectedPlot(() => inputs[0]?.channel.toString())
  // }, [inputs])

  // let a = 5;

  return (
    analogInData.length == 0 ? 
      (<LoadingIndicator/>)
      :
      (
        <div>
          <div className="flex flex-col">
            <div className="flex flex-row justify-between">
              <select className="w-[40%]" value={selectedPlot} onChange={e => setSelectedPlot(e.target.value)}>
                {
                  // IOPoints[IOPointType.ANALOG_INPUT].map((input, index) => {
                  IOPoints.getIOPoints(IOPointType.ANALOG_INPUT).map((input, index) => {
                    const label = input.label != "" ? `${input.label} (Input ${input.channel})` : `Input ${input.channel}`
                    return <option key={input.channel?.toString()} value={input.channel}>{label}</option>
                  })
                }
              </select>
              <R2Button
                text="Add Plot"
                className="w-[40%]"
                onClick={() => {
                  let plots = dashboardContext.configuration.plots;
                  plots.push(new PlotConfiguration({enabled: true, data_sources: [selectedPlot.toString()]}))
                  setContext((c) => {
                    c.configuration.plots = plots;
                    return c;
                  })
                }}
              />
            </div>
              <R2Button
                text="Save Configuration"
                onClick={() => {
                  save_configuration()
                }}
              />
            </div>
          <div>
              {dashboardContext.configuration.plots.map((plot_configuration, plot_index) => (
                <div>
                  <PlotContainer
                    key={plot_index.toString()} 
                    data_name={
                      // inputs?.[plot_configuration.data_sources[0]].label == "" ? `Analog Input ${plot_configuration.data_sources[0]}` : inputs?.[plot_configuration.data_sources[0]].label
                      IOPoints[IOPointType.ANALOG_INPUT]?.[plot_configuration.data_sources[0]]?.label == "" ? `Analog Input ${plot_configuration.data_sources[0]}` : IOPoints[IOPointType.ANALOG_INPUT]?.[plot_configuration.data_sources[0]]?.label
                    }
                    data={filter_plot_data(analogInData, parseInt(plot_configuration.data_sources[0]))}
                    // y_label={inputs?.[plot_configuration.data_sources[0]].measurement_unit == "" ? null : inputs?.[plot_configuration.data_sources[0]].measurement_unit}
                    y_label={IOPoints[IOPointType.ANALOG_INPUT]?.[plot_configuration.data_sources[0]]?.measurement_unit == "" ? null : IOPoints[IOPointType.ANALOG_INPUT]?.[plot_configuration.data_sources[0]]?.measurement_unit}
                    plot_index={plot_index}
                  />
                </div>
              ))}
          </div>
        </div>
      )
  );
};

export default AnalogInputPlot;
