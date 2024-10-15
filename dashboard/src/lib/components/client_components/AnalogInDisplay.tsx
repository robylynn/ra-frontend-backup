"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import DashboardContext from "@/lib/models/dashboard_context";
import { Topic } from "roslib";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";

const AnalogInDisplay = () => {
  // Initialize state with an object of
  // const [values, setValues] = useState(Array<number>(3).fill(0));
  // const [types, setTypes] = useState(Array<string>(3).fill(""));

  // const analog_in_topic = useRef<Topic>(null);
  const { dashboardContext } = useContext(DashboardContext);

  // Subscribe to the topics and update state
  // NOTE: If you pass a function to the state update function, React passes
  // the current state to the function and expects the new state to be returned.
  // useEffect(() => {
  //   const subscribeToAnalogInput = () => {
  //     if (!analog_in_topic.current) {
  //       if (dashboardContext.ra_ros_websocket) {
  //         analog_in_topic.current = new Topic({
  //           ros: dashboardContext.ra_ros_websocket,
  //           name: "/gpio/analog_in_electrical_units",
  //           messageType: "r2c_interfaces/AnalogIn",
  //         });

  //         analog_in_topic.current.subscribe((message) => {
  //           // set values and set types
  //           setValues((prevValues) =>
  //             prevValues.map((value, i) =>
  //               (message as any).read_channels[i]
  //                 ? (message as any).values[i]
  //                 : value
  //             )
  //           );
  //           setTypes((prevTypes) =>
  //             prevTypes.map((type, i) =>
  //               (message as any).read_channels[i]
  //                 ? (message as any).types[i]
  //                 : type
  //             )
  //           );
  //         });
  //         console.log("Subscribed to /gpio/analog_in_electrical_units");
  //       }
  //     }
  //   };

  //   subscribeToAnalogInput();

  //   // Cleanup function to unsubscribe on component unmount
  //   return () => {
  //     if (analog_in_topic.current) {
  //       analog_in_topic.current.unsubscribe();
  //       analog_in_topic.current = null;
  //       console.log("Unsubscribed from /gpio/analog_in_electrical_units");
  //     }
  //   };
  // }, [dashboardContext.ra_ros_websocket]);

  const interpolateColor = (value) => {
    const startColor = [169, 169, 169]; // RGB for gray
    const endColor = [59, 136, 195]; // RGB for #3B88C3
    const ratio = value / 10;

    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // console.log("rendering display")
  // useEffect(() => {
  //   console.log("analog data updated in display")
  // }, [dashboardContext.analog_in_data?.values?.[0]])

  // const [testUpdateCounter, setTestUpdateCounter] = useState(0);
  

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setTestUpdateCounter((counter) => counter + 1);
  //     console.log("test ionterval")
  //   }, 0.1 * 1000);
  //   return () => clearInterval(intervalId);
  // }, []);

  // useEffect(() => {
  //   console.log("got new context in display")
  // }, [dashboardContext.analog_in_data?.values?.[0]])

  return (
    <div className="grow">
      <h2>Analog Inputs</h2>
      <h2>{dashboardContext.analog_in_data?.values?.[0]}</h2>
      {dashboardContext.ra_ros_websocket ? (
        <div
          key="v2"
          className="flex flex-row justify-around gap-[10px] max-w-[100%] grow"
        >
          {dashboardContext.analog_in_data?.values?.map((value, index) => (
            <div
              key={index}
              className="flex flex-col items-center h-full items-center justify-center"
            >
              <h3>{index}</h3>
              <div
                className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-white transition ease-in-out delay-300`}
                style={{ backgroundColor: interpolateColor(value) }}
              >
                <p>{value.toFixed(2)}</p>
              </div>
              {/* <p>Type: {types[index]}</p> */}
              <p>Type: {dashboardContext.analog_in_data.types[index]}</p>
            </div>
          ))}
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  );
};

export default AnalogInDisplay;
