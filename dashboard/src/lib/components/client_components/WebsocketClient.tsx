// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import { useContext, useEffect, useState, useRef } from "react";
import DashboardContext, {
  ConfigServices,
} from "@/lib/models/dashboard_context";
import { getSession } from "next-auth/react";
import ROSLIB, { Topic } from "roslib";
import { IOPointType } from "@/lib/models/api_models";
import { AnalogInData, AxisData } from "@/lib/models/ros_models";
import { ELEVATION_0 } from "@blueprintjs/core/lib/esm/common/classes";
// import { Topic } from "roslib";

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

function connectROSWebSocket(
  url: string,
  timeout: number
): Promise<ROSLIB.Ros> {
  timeout = timeout || 2000;
  return new Promise(function (resolve, reject) {
    const socket = new ROSLIB.Ros({
      url: url,
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
      console.log("Rosbridge server connection error:", e);
      socket.close();
      done();
    }

    socket.on("connection", () => {
      console.log("Connected to Rosbridge server");
      resolve(socket);
      done();
    });

    socket.on("error", error);
  });
}

export default function RAWebSocket(props: {
  websocket_path: string;
  reconnect_period_seconds: number;
}) {
  const { dashboardContext, setContext } = useContext(DashboardContext);
  const [reconnectCounter, setReconnectCounter] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const ra_ros_websocket: React.MutableRefObject<null | ROSLIB.Ros> =
    useRef(null);
  const websocket_connecting: React.MutableRefObject<boolean> = useRef(false);

  const analog_in_subscription = useRef<Topic | null>();
  const digital_in_subscription = useRef<Topic | null>();
  const axis_velocity_subscriptions = useRef<Array<Topic> | null>(new Array(4));

  const set_ROS_context = (config_services: ConfigServices) => {
    setContext((c) => ({
      ...c,
      ra_ros_websocket: ra_ros_websocket.current,
      IO_config_services: config_services,
    }));
  };

  const close_websocket = () => {
    console.warn("ROSBRIDGE WEBSOCKET: Connection to Rosbridge server closed");
    websocket_connecting.current = false;
    if (
      ra_ros_websocket.current != null &&
      ra_ros_websocket.current.isConnected
    ) {
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
                console.error(
                  "ROSBRIDGE WEBSOCKET: Error connecting to Rosbridge server:",
                  error
                );
                close_websocket();
              });

              const digital_in_config_service = new ROSLIB.Service({
                ros: socket,
                name: "/configure_digital_in",
                serviceType: "r2c_interfaces/ConfigureDigitalIn",
              });

              const analog_in_config_service = new ROSLIB.Service({
                ros: socket,
                name: "/configure_analog_in",
                serviceType: "r2c_interfaces/ConfigureAnalogIn",
              });

              let config_services: ConfigServices = new ConfigServices();
              config_services.set_service(
                IOPointType.ANALOG_INPUT,
                analog_in_config_service
              );
              config_services.set_service(
                IOPointType.DIGITAL_INPUT,
                digital_in_config_service
              );

              ra_ros_websocket.current = socket;
              websocket_connecting.current = false;

              set_ROS_context(config_services);
            })
            .catch((err) => {
              console.error(
                "ROSBRIDGE WEBSOCKET: ROS Websocket connection error: " + err
              );
              websocket_connecting.current = false;
              ra_ros_websocket.current = null;
              set_ROS_context(null);
            });
        } else {
          if (ra_ros_websocket != null) {
            console.warn(
              "ROSBRIDGE WEBSOCKET: Session does not exist, closing socket..."
            );
            close_websocket();
          }
        }
      });
    }
  }, [reconnectCounter]);

  // const [analogInState, setAnalogInState] = useState<AnalogInData>();

  // useEffect(() => {
  //   // setContext((c) => {
  //   //   console.log("setting analog in data");
  //   //   c.analog_in_data = analogInState;
  //   //   return c;
  //   // })
  //   setContext((c) => (
  //     {...c, analog_in_data: analogInState}
  //   ))
  // }, [analogInState])

  // useEffect(() => {
  //   console.log("got new context")
  // }, [dashboardContext.analog_in_data?.values?.[0]])

  const subscribeToAnalogInputs = () => {
    console.log("running subscription effect");
    if (!analog_in_subscription.current) {
      console.log("no subscription");
      if (dashboardContext.ra_ros_websocket) {
        console.log("websocket active");
        analog_in_subscription.current = new Topic({
          ros: dashboardContext.ra_ros_websocket,
          name: `/gpio/analog_in_electrical_units`,
          messageType: "r2c_interfaces/AnalogInData",
        });

        analog_in_subscription.current.subscribe((message) => {
          setContext((c) => {
            console.log("got analog in data");
            return { ...c, analog_in_data: message as AnalogInData };
          });
        });

        console.log(`Subscribed to /gpio/analog_in_electrical_units`);
      }
    }
  };

  // const subscribeToMotionData = () => {};

  const subscribeToMotionData = (axisIndex: number) => {
    if (!axis_velocity_subscriptions.current[axisIndex]) {
      if (dashboardContext.ra_ros_websocket) {
        axis_velocity_subscriptions.current[axisIndex] = new Topic({
          ros: dashboardContext.ra_ros_websocket,
          name: `/axis_${axisIndex}/pos_vel`,
          messageType: "r2c_interfaces/EncoderEstimates",
        });

        axis_velocity_subscriptions.current[axisIndex].subscribe(
          (message: AxisData) => {
            setContext((c) => {
              const data_point: AxisData = {
                stamp: message.stamp,
                position: message.position,
                velocity: message.velocity,
                axis_index: axisIndex,
              };
              let newAxisData;
              if (!c.axis_data || !(axisIndex in c.axis_data)) {
                newAxisData = {
                  ...c.axis_data,
                  [axisIndex]: [data_point].slice(-50),
                };
              } else {
                newAxisData = {
                  ...c.axis_data,
                  [axisIndex]: [...c.axis_data?.[axisIndex], data_point].slice(
                    -50
                  ),
                };
              }
              return { ...c, axis_data: newAxisData };
            });
            // setVelocityData((prevData) => {
            //   const newVelocityData = {
            //     ...prevData,
            //     [`axis_${axisIndex}`]: [
            //       ...prevData[`axis_${axisIndex}`],
            //       { time: new Date(), velocity: (message as any).velocity },
            //     ].slice(-50), // Keep only the latest 50 data points
            //   };
            //   return newVelocityData;
            // });
          }
        );

        console.log(`Subscribed to /axis_${axisIndex}/pos_vel`);
      }
    }
  };

  const unsubscribeFromData = () => {
    if (!dashboardContext.ra_ros_websocket) {
      if (analog_in_subscription.current) {
        analog_in_subscription.current.unsubscribe();
        analog_in_subscription.current = null;
        console.log(`Unsubscribed from /gpio/analog_in_electrical_units`);
      }

      axis_velocity_subscriptions.current.forEach((s, i) => {
        s.unsubscribe();
        console.log(`Unsubscribed from ${s.name}`);
        axis_velocity_subscriptions.current[i] = null;
      });
    }
  };

  useEffect(() => {
    subscribeToAnalogInputs();
    [0, 1, 2, 3].forEach((i) => subscribeToMotionData(i));
    // Cleanup function to unsubscribe on component unmount
    return () => {
      unsubscribeFromData();
      // if (analog_in_subscription.current)
      //   analog_in_subscription.current.unsubscribe();
      // analog_in_subscription.current = null;
      // console.log(`Unsubscribed from /gpio/analog_in_electrical_units`);
    };
  }, [reconnectCounter]);
  // }, [dashboardContext.ra_ros_websocket]);

  // useEffect(() => {
  //   const subscribeToAnalogInputs = () => {
  //     if (!analog_in_subscription.current) {
  //       if (dashboardContext.ra_ros_websocket) {
  //         analog_in_subscription.current = new Topic({
  //           ros: dashboardContext.ra_ros_websocket,
  //           name: `/gpio/analog_in_electrical_units`,
  //           messageType: "r2c_interfaces/AnalogInData",
  //         });

  //         analog_in_subscription.current.subscribe((message) => {
  //           setContext((c) => {
  //             console.log("got analog in data")
  //             return {...c, analog_in_data: message as AnalogInData}
  //           })

  //         });

  //         console.log(`Subscribed to /gpio/analog_in_electrical_units`);
  //       }
  //     }
  //   };

  //   subscribeToAnalogInputs();
  //   // Cleanup function to unsubscribe on component unmount
  //   return () => {
  //     if (analog_in_subscription.current)
  //       analog_in_subscription.current.unsubscribe();
  //     analog_in_subscription.current = null;
  //     console.log(`Unsubscribed from /gpio/analog_in_electrical_units`);
  //   };
  // }, [dashboardContext.ra_ros_websocket]);

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
