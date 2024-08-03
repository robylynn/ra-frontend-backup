import React, { useEffect, useState, useRef, useContext } from "react";
import ros from '@/lib/components/ros/RosContext'; // Adjust the path as necessary
// import './CircularButton.css'; // Import CSS for styling
import "./AnalogInDisplay.css"; // Import CSS for styling
import DashboardContext from "@/lib/models/dashboard_context";

const AnalogInDisplay = () => {
  // Initialize state with an object of
  const [values, setValues] = useState(Array(3).fill(0));
  const [types, setTypes] = useState(Array(3).fill(""));

  const subscription = useRef(null);
  const { dashboardContext } = useContext(DashboardContext);

  // Subscribe to the topics and update state
  // NOTE: If you pass a function to the state update function, React passes
  // the current state to the function and expects the new state to be returned.
  useEffect(() => {
    const subscribeToAnalogInput = () => {
      if (!subscription.current) {
        if (dashboardContext.ra_ros_websocket) {
          subscription.current = dashboardContext.ra_ros_websocket.
          subscription.current = dashboardContext.ra_ros_websocket.subscribeToTopic(
            "/gpio/analog_in_electrical_units",
            "r2c_interfaces/AnalogIn",
            (message) => {
              // set values and set types
              setValues((prevValues) =>
                prevValues.map((value, i) =>
                  message.read_channels[i] ? message.values[i] : value
                )
              );
              setTypes((prevTypes) =>
                prevTypes.map((type, i) =>
                  message.read_channels[i] ? message.types[i] : type
                )
              );
            }
          );

          console.log("Subscribed to /gpio/analog_in_electrical_units");
        }
      }
    };

    subscribeToAnalogInput();

    // Cleanup function to unsubscribe on component unmount
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = null;
        console.log("Unsubscribed from /gpio/analog_in_electrical_units");
      }
    };
  }, []);

  // const calculateColor = (value) => {
  //   const blueValue = Math.min(255, Math.max(0, Math.round((value / 10) * 255)));
  //   return `rgb(${blueValue}, ${blueValue}, 255)`;
  // };

  const interpolateColor = (value) => {
    const startColor = [169, 169, 169]; // RGB for gray
    const endColor = [59, 136, 195]; // RGB for #3B88C3
    const ratio = value / 10;

    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div>
      <h2>Analog Inputs</h2>
      <div className="inputs-container">
        {values.map((value, index) => (
          <div key={index} className="input-wrapper">
            <h3>{index}</h3>
            <div
              className="status-indicator"
              style={{ backgroundColor: interpolateColor(value) }}
            ></div>
            <p>Type: {types[index]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalogInDisplay;
