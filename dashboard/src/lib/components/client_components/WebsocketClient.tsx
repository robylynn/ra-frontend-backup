// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, useEffect, useState, useRef } from "react";
import DashboardContext from "@/lib/models/dashboard_context";
import { getSession } from "next-auth/react";
import ROSLIB from "roslib";

function connectWebSocket(url: string, timeout: number): Promise<WebSocket> {
  timeout = timeout || 2000;
  return new Promise(function (resolve, reject) {
    
    const socket = new WebSocket(url);

    const timer = setTimeout(function () {
      reject(new Error("webSocket timeout"));
      done();
      socket.close();
    }, timeout);

    function done() {
      // cleanup all state here
      clearTimeout(timer);
      socket.removeEventListener("error", error);
    }

    function error(e: Event) {
      reject(e);
      socket.close();
      done();
    }

    socket.addEventListener("open", function () {
      resolve(socket);
      done();
    });
    socket.addEventListener("error", error);
  });
}

function connectROSWebSocket(url: string, timeout: number): Promise<ROSLIB.Ros> {
  timeout = timeout || 2000;
  return new Promise(function (resolve, reject) {
    
    const socket = new ROSLIB.Ros({
      url: url
    });

    const timer = setTimeout(function () {
      reject(new Error("ROS webSocket timeout"));
      done();
      socket.close();
    }, timeout);

    function done() {
      // cleanup all state here
      clearTimeout(timer);
      socket.on("error", () => {});
    }

    function error(e: Event) {
      reject(e);
      console.log('Rosbridge server connection error:', e);
      socket.close();
      done();
    }
    
    socket.on("connection", () => {
      console.log('Connected to Rosbridge server');
      resolve(socket);
      done();
    })

    socket.on("error", error)
  });
}

export default function RAWebSocket(props: {
  websocket_path: string;
  reconnect_period_seconds: number;
}) {
  const { dashboardContext: context, setContext } = useContext(DashboardContext);
  const [reconnectCounter, setReconnectCounter] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const ra_ros_websocket: React.MutableRefObject<null | ROSLIB.Ros> = useRef(null);
  const websocket_connecting: React.MutableRefObject<boolean> = useRef(false);

  const set_ROS_context = (config_service: ROSLIB.Service | null) => {
    setContext((c) => {
      c.ra_ros_websocket = ra_ros_websocket.current;
      c.config_service = config_service
      return c;
    });
  }

  const close_websocket = () => {
    console.warn('ROSBRIDGE WEBSOCKET: Connection to Rosbridge server closed');
    websocket_connecting.current = false;
    if (ra_ros_websocket.current != null && ra_ros_websocket.current.isConnected) {
      ra_ros_websocket.current.close();
    }
    ra_ros_websocket.current = null;
    set_ROS_context(null);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setReconnectCounter((counter) => counter + 1);
    }, props.reconnect_period_seconds * 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (ra_ros_websocket.current == null && !websocket_connecting.current) {
      getSession().then((session) => {
        if (session != null) {
          websocket_connecting.current = true;
          connectROSWebSocket(props.websocket_path, 1000)
            .then((socket) => {
              socket.on("message", (event: MessageEvent<Blob>) => {
                event.data.text().then(setMessage);
              });

              socket.on("close", () => {
                close_websocket();
              });

              socket.on("error", (error) => {
                console.error('ROSBRIDGE WEBSOCKET: Error connecting to Rosbridge server:', error);
                close_websocket();
              });

              const config_service = new ROSLIB.Service({
                ros: socket,
                name: '/gpio/configure_analog_in',
                serviceType: 'r2c_interfaces/ConfigureAnalogIn'
              });

              ra_ros_websocket.current = socket;
              websocket_connecting.current = false;

              set_ROS_context(config_service);
            })
            .catch((err) => {
              console.error("ROSBRIDGE WEBSOCKET: ROS Websocket connection error: " + err);
              websocket_connecting.current = false;
              ra_ros_websocket.current = null;
              set_ROS_context(null);
            });
        } else {
          if (ra_ros_websocket != null) {
            console.warn("ROSBRIDGE WEBSOCKET: Session does not exist, closing socket...");
            close_websocket();
          }
        }
      });
    }
  }, [reconnectCounter]);

  useEffect(() => {
    return () => {
      close_websocket();
    };
  }, []);

  useEffect(() => {
    console.log(`ROSBRIDGE WEBSOCKET: message: ${message}`);
  }, [message]);

  return <></>;
}

export function RAServerWebSocket(props: {
  websocket_path: string;
  reconnect_period_seconds: number;
}) {
  // TODO Implement this
  return <></>;
}
