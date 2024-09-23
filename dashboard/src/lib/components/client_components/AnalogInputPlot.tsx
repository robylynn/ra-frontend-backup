// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

// AnalogInputPlot.js
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
import { NextAPIResponseInterface } from "@/lib/models/api_models";

interface AnalogInputDataPoint {
  time: number;
  [key: number]: number;
}

const Plot = (props: { data: Array<AnalogInputDataPoint> }) => {
  return (
    <div>
      {/* <h2>Analog Inputs</h2> */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={0}
            stroke="#8884d8"
            isAnimationActive={false}
            animationBegin={0}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey={1}
            stroke="#82ca9d"
            isAnimationActive={false}
            animationBegin={0}
            animationDuration={50}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey={2}
            stroke="#ffc658"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnalogInputPlot = (props: { length: number }) => {
  const { inputs } = useContext(AnalogInputContext);
  const { dashboardContext, setContext } = useContext(DashboardContext);
  // const [visiblePlots, setVisiblePlots] = useState([0, 1, 2]);
  // const [visiblePlots, setVisiblePlots] = useState(new UIConfiguration());
  const [analogInData, setAnalogInData] = useState<Array<AnalogInputDataPoint>>(
    []
  );
  
  const analog_in_subscription = useRef<Topic | null>();
  const initial_data_acquired = useRef<boolean>();

  const togglePlotVisibility = (index: number) => {
    if (dashboardContext.configuration.plot_active(index)) {
      dashboardContext.configuration.plots[index].enabled = !dashboardContext.configuration.plots[index].enabled;
    }

    setContext(() => dashboardContext)
    // try {
    //   visiblePlots.plots[index].enabled = !visiblePlots.plots[index].enabled;
    //   dashboardContext.configuration.
    // } catch (e) {
    //   console.log(`Plot ${index} not configured`)
    // }
    // setVisiblePlots(visiblePlots);
    // if (visiblePlots.includes(index)) {
    //   setVisiblePlots(visiblePlots.filter((i) => i !== index));
    // } else {
    //   setVisiblePlots([...visiblePlots, index]);
    // }
  };

  const save_configuration = async () => {
    let body = dashboardContext.configuration;
    // let ui_configr
    let res: NextAPIResponseInterface = await fetch(
      "api/backend/configuration/ui/save_configuration",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(body),
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

  // let a = 5;
  // inputs.forEach((v, i) => setVisiblePlots((plots) => plots.forEach(v, i) => {}))
  // setVisiblePlots((plots) => {
  //   plots.forEach((p) => {console.log(p)})
  //   return plots;
  // })

  return (
    analogInData.length == 0 ? 
      (<LoadingIndicator/>)
      :
      (
        <div>
          <div className="flex flex-col">
            <select>
            {/* <option value={"abc"}>abc</option> */}
              
              {
                inputs.map((input, index) => (
                  <option value={input.channel}>{input.channel}</option>
                ))
              }
              
              
            </select>
            <div className="flex flex-row justify-between">
              {inputs
                .filter((input) => input.enabled)
                .map((input, index) => (
                  <div key={index}>
                    <label>
                      <input
                        type="checkbox"
                        // checked={visiblePlots.includes(index)}
                        checked={dashboardContext.configuration.plot_active(index)}
                        onChange={() => togglePlotVisibility(index)}
                      />
                      Show Plot {input.label}
                    </label>
                  </div>
                ))}
              </div>
              <R2Button
                text="Save Configuration"
                onClick={() => {
                  // fetch()
                  // let res: NextAPIResponseInterface = await fetch(
                  //   "api/backend/configuration/io/configure_point",
                  //   {
                  //     method: "POST",
                  //     headers: {
                  //       Accept: "application/json",
                  //       "Content-Type": "application/json",
                  //     },
                  //     mode: "cors",
                  //     body: JSON.stringify(body),
                  //   }
                  // ).then((res) => res.json());
                  // console.log("POST response: " + JSON.stringify(res.data));
                }}
              />
            </div>
          <div>
            {/* Plot component here, using visiblePlots to determine which plots to show */}
              {/* {visiblePlots.map((v, i) => (
                // <p>{i}</p>
                <Plot data={analogInData} />
              ))} */}
              {dashboardContext.configuration.plots.map((v, i) => (
                // <p>{i}</p>
                <Plot data={analogInData} />
              ))}
            {/* <Plot data={analogInData} /> */}
          </div>
        </div>
      )
  );
};

export default AnalogInputPlot;
