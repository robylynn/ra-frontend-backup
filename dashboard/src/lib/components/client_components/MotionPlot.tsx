"use client"

import React, { useEffect, useState, useRef, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Topic } from 'roslib';
import DashboardContext from "@/lib/models/dashboard_context";

const VelocityPlot = () => {
  // Initialize state with an object of four arrays for velocity data
  const [velocityData, setVelocityData] = useState({
    axis_0: [],
    axis_1: [],
    axis_2: [],
    axis_3: []
  });
  
  
  const subscriptions = useRef<Map<number, Topic>>(new Map<number, Topic>());
  const { dashboardContext } = useContext(DashboardContext);

  // Subscribe to the topics and update state
  // NOTE: If you pass a function to the state update function, React passes
  // the current state to the function and expects the new state to be returned. 
  useEffect(() => {
    const subscribeToVelocities = (axisIndex: number) => {
      if (!subscriptions.current[axisIndex]) {
        if (dashboardContext.ra_ros_websocket) {
            subscriptions.current[axisIndex] = new Topic({
                ros: dashboardContext.ra_ros_websocket,
                name: `/axis_${axisIndex}/pos_vel`,
                messageType: 'r2c_interfaces/EncoderEstimates'
            });

            subscriptions.current[axisIndex].subscribe((message) => {
                setVelocityData((prevData) => {
                    const newVelocityData = {
                    ...prevData,
                    [`axis_${axisIndex}`]: [
                        ...prevData[`axis_${axisIndex}`],
                        { time: new Date(), velocity: message.velocity }
                    ].slice(-50) // Keep only the latest 50 data points
                    };
                    return newVelocityData;
                });
            });

            // subscriptions.current[axisIndex] = 
            // ros.subscribeToTopic(`/axis_${axisIndex}/pos_vel`, 'r2c_interfaces/EncoderEstimates', (message) => {

            

            
            // });

            console.log(`Subscribed to /axis_${axisIndex}/pos_vel`);
        }
        
      }
    };

    // Subscribe to all 4 axis topics
    [0, 1, 2, 3].forEach(subscribeToVelocities);

    // Cleanup function to unsubscribe on component unmount
    return () => {
      [0, 1, 2, 3].forEach((axisIndex) => {
        if (subscriptions.current[axisIndex]) {
          subscriptions.current[axisIndex].unsubscribe();
          subscriptions.current[axisIndex] = null;
          console.log(`Unsubscribed from /axis_${axisIndex}/pos_vel`);
        }
      });
    };
  }, []); 

  // Combine data for plotting
  const combinedData = velocityData.axis_0.map((_, index) => ({
    time: velocityData.axis_0[index]?.time,
    axis_0: velocityData.axis_0[index]?.velocity,
    axis_1: velocityData.axis_1[index]?.velocity,
    axis_2: velocityData.axis_2[index]?.velocity,
    axis_3: velocityData.axis_3[index]?.velocity,
  }));

  return (
    <div>
      <h2>Axes Velocities (rev/s)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone"
                dataKey="axis_0"
                stroke="#8884d8"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-in-out" />
          <Line type="monotone"
                dataKey="axis_1"
                stroke="#82ca9d"
                isAnimationActive={false}
                animationBegin={0}
                animationDuration={50}
                animationEasing="ease-in-out" />
          <Line type="monotone" dataKey="axis_2" stroke="#ffc658" isAnimationActive={false} />
          <Line type="monotone" dataKey="axis_3" stroke="#ff7300" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VelocityPlot;