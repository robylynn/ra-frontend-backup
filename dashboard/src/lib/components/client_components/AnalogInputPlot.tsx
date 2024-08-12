// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client"

// AnalogInputPlot.js
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AnalogInputContext } from '@/lib/components/client_components/AnalogInputContext';
import { Topic } from 'roslib';

const AnalogInputPlot = () => {
  const { inputs } = useContext(AnalogInputContext);
  const [visiblePlots, setVisiblePlots] = useState([]);
  const analog_in_subscription = useRef<Topic | null>();

  const togglePlotVisibility = (index) => {
    if (visiblePlots.includes(index)) {
      setVisiblePlots(visiblePlots.filter((i) => i !== index));
    } else {
      setVisiblePlots([...visiblePlots, index]);
    }
  };

  // useEffect(() => {
  //   const subscribeToVelocities = (axisIndex: number) => {
  //     if (!subscriptions.current[axisIndex]) {
  //       if (dashboardContext.ra_ros_websocket) {
  //           subscriptions.current[axisIndex] = new Topic({
  //               ros: dashboardContext.ra_ros_websocket,
  //               name: `/axis_${axisIndex}/pos_vel`,
  //               messageType: 'r2c_interfaces/EncoderEstimates'
  //           });

  //           subscriptions.current[axisIndex].subscribe((message) => {
  //               setVelocityData((prevData) => {
  //                   const newVelocityData = {
  //                   ...prevData,
  //                   [`axis_${axisIndex}`]: [
  //                       ...prevData[`axis_${axisIndex}`],
  //                       { time: new Date(), velocity: message.velocity }
  //                   ].slice(-50) // Keep only the latest 50 data points
  //                   };
  //                   return newVelocityData;
  //               });
  //           });

  //           // subscriptions.current[axisIndex] = 
  //           // ros.subscribeToTopic(`/axis_${axisIndex}/pos_vel`, 'r2c_interfaces/EncoderEstimates', (message) => {

            

            
  //           // });

  //           console.log(`Subscribed to /axis_${axisIndex}/pos_vel`);
  //       }
        
  //     }
  //   };

  //   // Subscribe to all 4 axis topics
  //   [0, 1, 2, 3].forEach(subscribeToVelocities);

  //   // Cleanup function to unsubscribe on component unmount
  //   return () => {
  //     [0, 1, 2, 3].forEach((axisIndex) => {
  //       if (subscriptions.current[axisIndex]) {
  //         subscriptions.current[axisIndex].unsubscribe();
  //         subscriptions.current[axisIndex] = null;
  //         console.log(`Unsubscribed from /axis_${axisIndex}/pos_vel`);
  //       }
  //     });
  //   };
  // }, []);

  return (
    <div>
      {inputs
        .filter((input) => input.enabled)
        .map((input, index) => (
          <div key={index}>
            <label>
              <input
                type="checkbox"
                checked={visiblePlots.includes(index)}
                onChange={() => togglePlotVisibility(index)}
              />
              {input.label}
            </label>
          </div>
        ))}
      <div>
        {/* Plot component here, using visiblePlots to determine which plots to show */}
        {visiblePlots.map((v, i) => <p>{i}</p>)}
      </div>
    </div>
  );
};

export default AnalogInputPlot;