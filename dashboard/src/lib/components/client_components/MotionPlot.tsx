"use client"

import React, { useEffect, useState, useRef, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Topic } from 'roslib';
import DashboardContext from "@/lib/models/dashboard_context";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";

const VelocityPlot = () => {
  // Initialize state with an object of four arrays for velocity data
  const [velocityData, setVelocityData] = useState({
    axis_0: [],
    axis_1: [],
    axis_2: [],
    axis_3: []
  });
  
  
  // const subscriptions = useRef<Map<number, Topic>>(new Map<number, Topic>());
  const { dashboardContext } = useContext(DashboardContext);
  // const { IOPoints, setIOPoints, addIOPoint, updateIOPoint, deleteIOPoint } =
  //   useContext(IOPointContext);

  // Subscribe to the topics and update state
  // NOTE: If you pass a function to the state update function, React passes
  // the current state to the function and expects the new state to be returned. 
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
  // }, [dashboardContext.ra_ros_websocket]); 

  // Combine data for plotting
  // const combinedDataOrig = velocityData.axis_0.map((_, index) => ({
  //   time: velocityData.axis_0[index]?.time,
  //   axis_0: velocityData.axis_0[index]?.velocity,
  //   axis_1: velocityData.axis_1[index]?.velocity,
  //   axis_2: velocityData.axis_2[index]?.velocity,
  //   axis_3: velocityData.axis_3[index]?.velocity,
  // }));

  interface axisPlotDataInterface {
    time: number,
    // time_1?: number,
    axis_0?: number
    axis_1?: number
    axis_2?: number
    axis_3?: number
  }
  
  const combinedData = () => {
    let combined_axis_data: Array<axisPlotDataInterface> = [];
    // let data_point: axisPlotDataInterface;
    dashboardContext.axis_data?.[0]?.forEach((p, i) => {
      let data_point: axisPlotDataInterface = {
        time: p.stamp.sec + p.stamp.nanosec / 1e9,
        // time_1: dashboardContext.axis_data[1]?.[i]?.stamp.sec + dashboardContext.axis_data[0]?.[i]?.stamp.nanosec / 1e9,
        // axis_0: dashboardContext.axis_data[0]?.[i]?.velocity,
        // axis_1: dashboardContext.axis_data[1]?.[i]?.velocity,
        // axis_2: dashboardContext.axis_data[2]?.[i]?.velocity,
        // axis_3: dashboardContext.axis_data[3]?.[i]?.velocity,
      }
      combined_axis_data.push(data_point)
      
      // for (const axis_index in )
      // combined_axis_data.push({
      //   time: p.stamp.sec + p.stamp.nanosec / 1e9,
      //   //for (const axis_index in dashboardContext.axis_data)
      //   [Object.keys(dashboardContext.axis_data).map((k) => [k]: dashboardContext.axis_data[k][i])]
      //   // axis_0: 
      // })
    })
    // for (const axis_index in dashboardContext.axis_data) {
    //   combined_axis_data.push({
    //     time: dashboardContext.axis_data[axis_index].map((v) => v.stamp.sec),
    //     axis_1: dashboardContext.axis_data[axis_index].map((v) => v.velocity),
    //     axis_2: dashboardContext.axis_data[axis_index].map((v) => v.velocity),
    //     axis_3: dashboardContext.axis_data[axis_index].map((v) => v.velocity)
    //   })
    // }
    return combined_axis_data
    // dashboardContext.axis_data.map((_, index) => ({
    // time: velocityData.axis_0[index]?.time,
    // axis_0: velocityData.axis_0[index]?.velocity,
    // axis_1: velocityData.axis_1[index]?.velocity,
    // axis_2: velocityData.axis_2[index]?.velocity,
    // axis_3: velocityData.axis_3[index]?.velocity,
  };

  // const axis0data = dashboardContext.axis_data?.[0]?.map((p) => (
  //   {
  //     time: p.stamp.sec + p.stamp.nanosec / 1e9,
  //     velocity: p.velocity,
  //     position: p.position
  //   }
  // ))

  let axisVelocities: Array<Array<axisPlotDataInterface>> = [];
  if (dashboardContext.axis_data) {
    axisVelocities = Object.keys(dashboardContext.axis_data).map((axis_index) => (
      
        dashboardContext.axis_data[axis_index].map(p => (
          {
            time: p.stamp.sec + p.stamp.nanosec / 1e9,
            velocity: p.velocity,
            position: p.position
          }
        ))
      
    ))
    let a = 5;
  }
  
  // }));

  // let z = dashboardContext;

  // useEffect(() => {
  //   console.log("analog data updated in plot")
  // }, [dashboardContext.analog_in_data?.values?.[0]])

  return (
    // dashboardContext.configuration?.configured ? 
    <div>
      <h2>Axis Velocities (rev/s)</h2>
      {/* <p>{velocityData.axis_0[0]?.velocity}</p>
      <p>{dashboardContext.analog_in_data?.values?.[0]}</p> */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis xAxisId="0" dataKey="time" />
          {/* <XAxis xAxisId="1" dataKey="time_1" allowDuplicatedCategory={false}/> */}
          <YAxis />
          <Tooltip />
          <Legend />
          {/* <Line type="monotone"
                dataKey="axis_0"
                stroke="#8884d8"
                isAnimationActive={false}
                animationBegin={0}
                animationDuration={50}
                animationEasing="ease-in-out" />
          <Line type="monotone"
                dataKey="axis_1"
                stroke="#82ca9d"
                isAnimationActive={false}
                animationBegin={0}
                animationDuration={50}
                animationEasing="ease-in-out" />
          <Line type="monotone" dataKey="axis_2" stroke="#ffc658" isAnimationActive={false} />
          <Line type="monotone" dataKey="axis_3" stroke="#ff7300" isAnimationActive={false} /> */}
          {/* <Line type="monotone" dataKey="velocity" data={axis0data} stroke="#557300" isAnimationActive={false} /> */}
          {
            axisVelocities.length ?
            axisVelocities.map((v, i) => (
              <Line type="monotone" label={`Axis ${i} Velocity`} dataKey="velocity" data={v} stroke="#557300" isAnimationActive={false} />
            ))
            :
            <></>
            // dashboardContext.axis_data ?
            // Object.keys(dashboardContext.axis_data).forEach((axis_index) => {
            //   // <Line/>
            //   <Line type="monotone" label={`Axis ${axis_index} Velocity`} dataKey="velocity" data={axis0data} stroke="#557300" isAnimationActive={false} />
            // })
            // if (dashboardContext.axis_data) {

            // }
            // dashboardContext.axis_data
          }
        </LineChart>
      </ResponsiveContainer>

    </div>
    // : <></>
  );
};

export default VelocityPlot;