import React, { createContext, useState, useEffect, useContext } from 'react';
import ROSLIB from 'roslib';

const RosContext = createContext(null);

export const useRos = () => useContext(RosContext);

export const RosProvider = ({ children }) => {
  const [ros, setRos] = useState(null);
  const [configService, setConfigService] = useState(null);

  useEffect(() => {
    // Connect to Rosbridge
    const rosInstance = new ROSLIB.Ros({
      url: 'ws://localhost:9090'
    });

    rosInstance.on('connection', () => {
      console.log('Connected to Rosbridge server');

      // Define the ROS service once the connection is established
      const service = new ROSLIB.Service({
        ros: rosInstance,
        name: '/configure_analog_in',
        serviceType: 'r2c_interfaces/ConfigureAnalogIn'
      });
      setConfigService(service);
    });

    rosInstance.on('error', (error) => {
      console.error('Error connecting to Rosbridge server:', error);
    });

    rosInstance.on('close', () => {
      console.log('Connection to Rosbridge server closed');
    });

    setRos(rosInstance);

    return () => {
      if (rosInstance) {
        rosInstance.close();
      }
    };
  }, []);

  return (
    <RosContext.Provider value={{ ros, configService }}>
      {children}
    </RosContext.Provider>
  );
};