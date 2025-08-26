// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { AxisServiceType, IOPointType } from '@/lib/models/api_models';
import {
    ApplicationServices,
    AxisCommandServices,
    IOCommandServices,
    IOConfigurationServices,
} from '@/lib/models/dashboard_context';
import {
    IRosTypeR2CInterfacesAnalogInData,
    IRosTypeR2CInterfacesAnalogOutData,
    IRosTypeR2CInterfacesDigitalInData,
    IRosTypeR2CInterfacesDigitalOutData,
    IRosTypeR2CInterfacesEncoderEstimates,
    IRosTypeR2CInterfacesGpioConfigurationState,
    IRosTypeR2CInterfacesHeartbeat,
    IRosTypeR2CInterfacesTorques,
    IRosTypeStdMsgsString,
} from '@/lib/models/ros_types';
import { getSession } from 'next-auth/react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ROSLIB, { Topic } from 'roslib';

// Define the properties for the Rosbridge component
interface RosbridgeWebSocketProps {
  rosbridgeUrl: string; // e.g., 'ws://localhost:9090'
  reconnectInterval?: number; // Time in milliseconds before attempting to reconnect (default: 3000ms)
//   children?: ReactNode; // Allow children components to interact with the ROS connection
}

// Interface for a simple Rosbridge Subscription
interface RosSubscription {
  topic: string;
  messageType: string;
  callback: (message: any) => void;
}

// Interface for a simple Rosbridge Service Client
interface RosServiceClient {
  name: string;
  serviceType: string;
}

const App: React.FC<RosbridgeWebSocketProps> = ({
  rosbridgeUrl,
  reconnectInterval = 3000,
//   children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]); // To log connection events
  const { dashboardContext, setDashboardContext } =
      useContext(DashboardContext);

  const ros = useRef<ROSLIB.Ros | null>(null); // ROSLIB.Ros instance
  const isMounted = useRef<boolean>(true);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // --- Utility for logging events ---
  const logDebugMessage = useCallback((message: string) => {
    setDebugLog((prevLogs) => {
      const newLogs = [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`];
      return newLogs.slice(-10); // Keep last 10 log entries
    });
    console.log(`Rosbridge: ${message}`);
  }, []);

const set_ROS_context = (
    config_services: IOConfigurationServices,
    io_state_services: IOCommandServices,
    application_services: ApplicationServices,
    axis_command_services: AxisCommandServices
) => {
    setDashboardContext({
        payload: {
            ros_config_services: config_services,
            ros_io_state_services: io_state_services,
            ros_application_services: application_services,
            ros_axis_command_services: axis_command_services,
            ra_ros_websocket: ros.current,
        },
        type: 'ros/set',
    });
};

const clear_ROS_context = () => {
    setDashboardContext({
        payload: {
            ros_config_services: null,
            ros_io_state_services: null,
            ros_application_services: null,
            ra_ros_websocket: ros.current,
        },
        type: 'ros/set',
    });
};

  // --- ROSLIB.js Connection Logic ---
  const connectRosbridge = useCallback(() => {
    // If a ROSLIB.Ros instance already exists, do nothing.
    // It's either connected, in the process of connecting, or handling a recent disconnection.
    // The reconnection timer will take care of creating a new instance if needed.
    if (ros.current) {
      logDebugMessage('ROSLIB instance already exists; connection state managed internally.');
      return;
    }

    setError(null); // Clear previous errors
    logDebugMessage(`Attempting to connect to Rosbridge: ${rosbridgeUrl}`);

    // Create a new ROSLIB.Ros instance
    const newRos = new ROSLIB.Ros({
      url: rosbridgeUrl
    });
    ros.current = newRos;

    newRos.on('connections', () => { // Event when connected
      if (isMounted.current) {
        setIsConnected(true);
        logDebugMessage('Connected to Rosbridge successfully.');
        // Clear any pending reconnection timer on successful connection
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }

        subscriptions.current = new Subscriptions(socket);

        set_ROS_context(
            initializeIOConfigurationServices(socket),
            initializeIOCommandServices(socket),
            initializeApplicationServices(socket),
            initializeAxisServices(socket)
        );

      }
    });

    newRos.on('error', (rosError) => { // Event on error
      if (isMounted.current) {
        console.error('ROSLIB.Ros error:', rosError);
        // ROSLIB.js errors often lead to a 'close' event, so we rely on 'close' for reconnection.
        // Just log the error here.
        setError('ROSLIB connection error. Check console for details.');
        logDebugMessage(`ROSLIB error: ${JSON.stringify(rosError)}`);
      }
    });

    newRos.on('close', () => { // Event when disconnected
      if (isMounted.current) {
        setIsConnected(false);
        logDebugMessage(`Disconnected from Rosbridge. Reconnecting in ${reconnectInterval / 1000}s...`);
        setError(`Disconnected from ROSbridge.`);

        // Clear the current ROSLIB instance so a new one can be created for reconnection
        if (ros.current) {
            ros.current.removeAllListeners(); // Clean up listeners associated with this instance
            ros.current = null; // Allow a new ROSLIB.Ros instance to be created on next attempt
        }

        // Attempt to reconnect after a delay
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
        reconnectTimer.current = setTimeout(() => {
          connectRosbridge(); // Reattempt connection by calling this function again
        }, reconnectInterval);
      }
    });
  }, [rosbridgeUrl, reconnectInterval, logDebugMessage]);

  // --- Effect for mounting and unmounting ---
  useEffect(() => {
    isMounted.current = true; // Component is mounted
    connectRosbridge(); // Initiate connection

    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false; // Mark as unmounted
      logDebugMessage('Component unmounted. Cleaning up ROSLIB.Ros connection.');
      if (ros.current) {
        ros.current.close(); // Close the ROSLIB.Ros connection
        ros.current.removeAllListeners(); // Ensure all listeners are cleaned up
      }
      ros.current = null;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };
  }, [connectRosbridge, logDebugMessage]);

  // --- Functions to manage Subscriptions and Service Clients ---
  const addSubscription = useCallback((sub: RosSubscription) => {
    if (ros.current && ros.current.isConnected) {
      logDebugMessage(`Adding subscription to topic: ${sub.topic}`);
      const listener = new ROSLIB.Topic({
        ros: ros.current,
        name: sub.topic,
        messageType: sub.messageType
      });
      listener.subscribe(sub.callback);
      return listener; // Return the listener to allow for unsubscribing
    } else {
      logDebugMessage(`Cannot add subscription for ${sub.topic}: Not connected.`);
      return null;
    }
  }, [logDebugMessage]);

  const removeSubscription = useCallback((listener: ROSLIB.Topic) => {
    if (listener) {
      logDebugMessage(`Removing subscription from topic: ${listener.name}`);
      listener.unsubscribe();
    }
  }, [logDebugMessage]);


  const callServiceClient = useCallback((client: RosServiceClient, request: any, onResponse: (result: any) => void, onError: (errorMsg: string) => void) => {
    if (ros.current && ros.current.isConnected) {
      logDebugMessage(`Calling service: ${client.name}`);
      const serviceClient = new ROSLIB.Service({
        ros: ros.current,
        name: client.name,
        serviceType: client.serviceType
      });
      const rosRequest = new ROSLIB.ServiceRequest(request);
      serviceClient.callService(rosRequest, onResponse, onError);
    } else {
      logDebugMessage(`Cannot call service ${client.name}: Not connected.`);
      onError('Not connected to Rosbridge.');
    }
  }, [logDebugMessage]);

    // --- Render UI ---
    return <></>;
    //   return (
    //     <div className="p-6 max-w-2xl mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-lg font-inter text-gray-800">
    //       <h2 className="text-3xl font-extrabold text-indigo-700 mb-4 text-center">
    //         ROSbridge Connection Status
    //       </h2>

    //       <div className="flex items-center justify-center mb-6">
    //         <div className={`w-4 h-4 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
    //         <p className={`text-lg font-semibold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
    //           {isConnected ? 'Connected to ROSbridge' : 'Disconnected from ROSbridge'}
    //         </p>
    //       </div>

    //       <div className="mb-4 text-sm text-gray-600">
    //         <p className="font-medium">URL: <span className="text-blue-800 break-words">{rosbridgeUrl}</span></p>
    //         <p className="font-medium">Reconnect Interval: <span className="text-blue-800">{reconnectInterval / 1000} seconds</span></p>
    //       </div>

    //       {error && (
    //         <div className="bg-red-200 border border-red-400 text-red-800 px-4 py-3 rounded-md mb-4 flex items-center shadow-sm">
    //           <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    //             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 00-2 0v2a1 1 0 102 0V9zm-1 5a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd" />
    //           </svg>
    //           <span className="font-medium">Error:</span> {error}
    //         </div>
    //       )}

    //       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner max-h-48 overflow-y-auto mb-6">
    //         <h3 className="text-lg font-semibold text-gray-700 mb-2">Connection Log</h3>
    //         {debugLog.length === 0 ? (
    //           <p className="text-gray-500 text-sm">Waiting for connection events...</p>
    //         ) : (
    //           <ul className="space-y-1 text-sm text-gray-700">
    //             {debugLog.map((log, index) => (
    //               <li key={index} className="break-words bg-white px-2 py-1 rounded-sm shadow-xs border border-gray-100">
    //                 {log}
    //               </li>
    //             ))}
    //           </ul>
    //         )}
    //       </div>

    //       {/* This is the area where you would integrate child components
    //           that utilize the addSubscription or callServiceClient functions. */}
    //       <div className="mt-6 border-t-2 border-indigo-200 pt-6">
    //         <h3 className="text-xl font-bold text-indigo-700 mb-4">ROS Interaction Area</h3>
    //         <p className="text-gray-700 mb-4">
    //           Once connected, you can use the provided `addSubscription`, `removeSubscription`, and `callServiceClient` functions
    //           to interact with your ROS system. These functions are exposed to child components via context.
    //         </p>

    //         {isConnected && (
    //           <RosConnectionContext.Provider value={{ addSubscription, removeSubscription, callServiceClient }}>
    //             {children}
    //           </RosConnectionContext.Provider>
    //         )}
    //         {!isConnected && (
    //             <p className="text-center text-gray-500 italic mt-4">
    //                 (Waiting for ROSbridge connection to enable ROS interactions)
    //             </p>
    //         )}
    //       </div>
    //     </div>
    //   );
};

// function connectWebSocket(url: string, timeout: number): Promise<WebSocket> {
//     timeout = timeout || 2000;
//     return new Promise(function (resolve, reject) {
//         const socket = new WebSocket(url);

//         const timer = setTimeout(function () {
//             reject(new Error('webSocket timeout'));
//             done();
//             socket.close();
//         }, timeout);

//         function done() {
//             // cleanup all state here
//             clearTimeout(timer);
//             socket.removeEventListener('error', error);
//         }

//         function error(e: Event) {
//             reject(e);
//             socket.close();
//             done();
//         }

//         socket.addEventListener('open', function () {
//             resolve(socket);
//             done();
//         });
//         socket.addEventListener('error', error);
//     });
// }

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
            reject(new Error('ROS webSocket timeout'));
            done();
            socket.close();
        }, timeout);

        function done() {
            // cleanup all state here
            clearTimeout(timer);
            socket.on('error', () => {});
        }

        function error(e: Event) {
            reject(e);
            console.log('Rosbridge server connection error:', e);
            socket.close();
            done();
        }

        socket.on('connection', () => {
            console.log('Connected to Rosbridge server');
            resolve(socket);
            done();
        });

        socket.on('error', error);
    });
}

type SubscriptionCallback = (message: ROSLIB.Message) => void;

interface SubscriptionInterface {
    ros_socket: ROSLIB.Ros;
    name: string;
    messageType: string;
    callback: SubscriptionCallback;
}

class Subscriptions {
    private _ros: ROSLIB.Ros;
    private _subscriptions: Array<{
        sub: Topic | null;
        params: SubscriptionInterface;
    }> = [];
    private _subscribed: boolean = false;

    constructor(ros: ROSLIB.Ros) {
        this._ros = ros;
    }

    public get subscribed(): boolean {
        return this._subscribed;
    }

    public add_subscription(params: SubscriptionInterface) {
        this._subscriptions.push({
            sub: null,
            params: params,
        });
    }

    public subscribeToTopics() {
        this._subscriptions.forEach((subscription) => {
            if (this._ros) {
                if (!subscription.sub) {
                    subscription.sub = new Topic({
                        ros: subscription.params.ros_socket,
                        name: subscription.params.name,
                        messageType: subscription.params.messageType,
                    });

                    subscription.sub.subscribe(subscription.params.callback);

                    console.log(`Subscribed to ${subscription.params.name}`);
                }
            }
        });
        this._subscribed = true;
    }

    public unsubscribeFromTopics() {
        this._subscriptions.forEach((subscription) => {
            if (subscription.sub) {
                subscription.sub.unsubscribe();
                subscription.sub = null;

                console.log(`Unsubscribed from ${subscription.params.name}`);
            }
        });
        this._subscribed = false;
    }
}

function initializeIOConfigurationServices(
    ros_websocket: ROSLIB.Ros
): IOConfigurationServices {
    const digital_in_config_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/configure_digital_in',
        serviceType: 'r2c_interfaces/ConfigureDigitalIn',
    });

    const digital_out_config_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/configure_digital_out',
        serviceType: 'r2c_interfaces/ConfigureDigitalOut',
    });

    const analog_in_config_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/configure_analog_in',
        serviceType: 'r2c_interfaces/ConfigureAnalogIn',
    });

    const analog_out_config_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/configure_analog_out',
        serviceType: 'r2c_interfaces/ConfigureAnalogOut',
    });

    let config_services: IOConfigurationServices =
        new IOConfigurationServices();
    config_services.set_service(
        IOPointType.ANALOG_INPUT,
        analog_in_config_service
    );
    config_services.set_service(
        IOPointType.ANALOG_OUTPUT,
        analog_out_config_service
    );
    config_services.set_service(
        IOPointType.DIGITAL_INPUT,
        digital_in_config_service
    );
    config_services.set_service(
        IOPointType.DIGITAL_OUTPUT,
        digital_out_config_service
    );

    return config_services;
}

function initializeIOCommandServices(
    ros_websocket: ROSLIB.Ros
): IOCommandServices {
    const digital_out_command_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/gpio/set_digital_out',
        serviceType: 'r2c_interfaces/SetDigitalOutputStates',
    });

    const analog_out_command_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/gpio/set_analog_out',
        serviceType: 'r2c_interfaces/SetAnalogOutputStates',
    });

    let io_state_services: IOCommandServices = new IOCommandServices();
    io_state_services.set_service(
        IOPointType.DIGITAL_OUTPUT,
        digital_out_command_service
    );

    io_state_services.set_service(
        IOPointType.ANALOG_OUTPUT,
        analog_out_command_service
    );

    return io_state_services;
}

function initializeApplicationServices(
    ros_websocket: ROSLIB.Ros
): ApplicationServices {
    // const endpoint_string_service = new ROSLIB.Service({
    //     ros: ros_websocket,
    //     name: '/app/set_endpoint',
    //     serviceType: 'r2c_interfaces/SetApplicationString',
    // });

    const application_state_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/app/set_state',
        serviceType: 'r2c_interfaces/SetApplicationString',
    });

    const robot_command_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/app/send_robot_command',
        serviceType: 'r2c_interfaces/SetApplicationString',
    });

    const application_services: ApplicationServices = new ApplicationServices();

    // application_services.set_service('set_endpoint', endpoint_string_service);
    application_services.set_service('set_state', application_state_service);
    application_services.set_service(
        'send_robot_command',
        robot_command_service
    );

    return application_services;
}

function initializeAxisServices(
    ros_websocket: ROSLIB.Ros
): AxisCommandServices {
    const clear_axis_errors_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/axis/clear_errors',
        serviceType: 'r2c_interfaces/ClearErrors',
    });

    const set_axis_state_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/axis/set_state',
        serviceType: 'r2c_interfaces/SetAxisState',
    });

    const jog_axis_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/motion/jog',
        serviceType: 'r2c_interfaces/JogAxis',
    });

    const axis_command_services = new AxisCommandServices();
    axis_command_services.set_service(
        AxisServiceType.CLEAR_ERRORS,
        clear_axis_errors_service
    );
    axis_command_services.set_service(
        AxisServiceType.SET_STATE,
        set_axis_state_service
    );
    axis_command_services.set_service(AxisServiceType.JOG, jog_axis_service);

    return axis_command_services;
}

export default function RAWebSocket(props: {
    websocket_path: string;
    reconnect_period_seconds: number;
}) {
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);
    const [reconnectCounter, setReconnectCounter] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

    const ra_ros_websocket: React.MutableRefObject<null | ROSLIB.Ros> =
        useRef(null);
    const websocket_connecting: React.MutableRefObject<boolean> = useRef(false);

    const subscriptions = useRef<Subscriptions | null>(null);

    const set_ROS_context = (
        config_services: IOConfigurationServices,
        io_state_services: IOCommandServices,
        application_services: ApplicationServices,
        axis_command_services: AxisCommandServices
    ) => {
        setDashboardContext({
            payload: {
                ros_config_services: config_services,
                ros_io_state_services: io_state_services,
                ros_application_services: application_services,
                ros_axis_command_services: axis_command_services,
                ra_ros_websocket: ra_ros_websocket.current,
            },
            type: 'ros/set',
        });
    };

    const clear_ROS_context = () => {
        setDashboardContext({
            payload: {
                ros_config_services: null,
                ros_io_state_services: null,
                ros_application_services: null,
                ra_ros_websocket: ra_ros_websocket.current,
            },
            type: 'ros/set',
        });
    };

    const close_websocket = () => {
        console.warn(
            'ROSBRIDGE WEBSOCKET: Connection to Rosbridge server closed'
        );
        websocket_connecting.current = false;
        if (
            ra_ros_websocket.current != null &&
            ra_ros_websocket.current.isConnected
        ) {
            ra_ros_websocket.current.close();
        }
        ra_ros_websocket.current = null;
        clear_ROS_context();
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
                            socket.on(
                                'message',
                                (event: MessageEvent<Blob>) => {
                                    event.data.text().then(setMessage);
                                }
                            );

                            socket.on('close', () => {
                                close_websocket();
                            });

                            socket.on('error', (error) => {
                                console.error(
                                    'ROSBRIDGE WEBSOCKET: Error connecting to Rosbridge server:',
                                    error
                                );
                                close_websocket();
                            });

                            ra_ros_websocket.current = socket;
                            websocket_connecting.current = false;

                            subscriptions.current = new Subscriptions(socket);

                            set_ROS_context(
                                initializeIOConfigurationServices(socket),
                                initializeIOCommandServices(socket),
                                initializeApplicationServices(socket),
                                initializeAxisServices(socket)
                            );
                        })
                        .catch((err) => {
                            console.error(
                                'ROSBRIDGE WEBSOCKET: ROS Websocket connection error: ' +
                                    err
                            );
                            websocket_connecting.current = false;
                            ra_ros_websocket.current = null;
                            clear_ROS_context();
                        });
                } else {
                    if (ra_ros_websocket != null) {
                        console.warn(
                            'ROSBRIDGE WEBSOCKET: Session does not exist, closing socket...'
                        );
                        close_websocket();
                    }
                }
            });
        }
    }, [reconnectCounter]);

    useEffect(() => {
        if (
            subscriptions.current &&
            dashboardContext.ra_ros_websocket?.isConnected &&
            !subscriptions.current.subscribed
        ) {
            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: `/gpio/analog_in_electrical_units`,
                messageType: 'r2c_interfaces/AnalogInData',
                callback: (message) => {
                    setDashboardContext({
                        payload: {
                            analog_in_data:
                                message as IRosTypeR2CInterfacesAnalogInData,
                        },
                        type: 'data/analog_in',
                    });
                },
            });

            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: `/gpio/analog_out_electrical_units`,
                messageType: 'r2c_interfaces/AnalogOutData',
                callback: (message) => {
                    setDashboardContext({
                        payload: {
                            analog_out_data:
                                message as IRosTypeR2CInterfacesAnalogOutData,
                        },
                        type: 'data/analog_out',
                    });
                },
            });

            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: `/gpio/digital_in`,
                messageType: 'r2c_interfaces/DigitalInData',
                callback: (message) => {
                    setDashboardContext({
                        payload: {
                            digital_in_data:
                                message as IRosTypeR2CInterfacesDigitalInData,
                        },
                        type: 'data/digital_in',
                    });
                },
            });

            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: `/gpio/digital_out`,
                messageType: 'r2c_interfaces/DigitalOutData',
                callback: (message) => {
                    console.log('got digital out data');
                    setDashboardContext({
                        payload: {
                            digital_out_data:
                                message as IRosTypeR2CInterfacesDigitalOutData,
                        },
                        type: 'data/digital_out',
                    });
                },
            });

            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: `/gpio/configuration_state`,
                messageType: 'r2c_interfaces/GpioConfigurationState',
                callback: (message) => {
                    setDashboardContext({
                        payload: {
                            gpio_configuration_state:
                                message as IRosTypeR2CInterfacesGpioConfigurationState,
                        },
                        type: 'data/gpio_configuration_state',
                    });
                },
            });

            [0, 1, 2, 4].forEach((axis_index) => {
                subscriptions.current.add_subscription({
                    ros_socket: dashboardContext.ra_ros_websocket,
                    name: `/axis_${axis_index}/pos_vel`,
                    messageType: 'r2c_interfaces/EncoderEstimates',
                    callback: (
                        message: IRosTypeR2CInterfacesEncoderEstimates
                    ) => {
                        const data_point: IRosTypeR2CInterfacesEncoderEstimates =
                            {
                                stamp: message.stamp,
                                position: message.position,
                                velocity: message.velocity,
                                axis_index: axis_index,
                            };

                        setDashboardContext({
                            payload: {
                                axis_index: axis_index,
                                axis_data: data_point,
                            },
                            type: 'data/axis',
                        });
                    },
                });

                subscriptions.current.add_subscription({
                    ros_socket: dashboardContext.ra_ros_websocket,
                    name: `/axis_${axis_index}/heartbeat`,
                    messageType: 'r2c_interfaces/Heartbeat',
                    callback: (message: IRosTypeR2CInterfacesHeartbeat) => {
                        setDashboardContext({
                            payload: {
                                axis_index: axis_index,
                                heartbeat: message,
                            },
                            type: 'data/axis_heartbeat',
                        });
                    },
                });

                subscriptions.current.add_subscription({
                    ros_socket: dashboardContext.ra_ros_websocket,
                    name: `/axis_${axis_index}/torque`,
                    messageType: 'r2c_interfaces/Torques',
                    callback: (message: IRosTypeR2CInterfacesTorques) => {
                        console.log('got torque');
                        setDashboardContext({
                            payload: {
                                axis_index: axis_index,
                                torque: message,
                            },
                            type: 'data/axis_torque',
                        });
                    },
                });
            });

            // subscriptions.current.add_subscription({
            //     ros_socket: dashboardContext.ra_ros_websocket,
            //     name: '/app/application_state',
            //     messageType: 'std_msgs/String',
            //     callback: (message: IRosTypeStdMsgsString) => {
            //         setDashboardContext({
            //             // payload: {
            //             //     state_name: 'callback_payload',
            //             //     state_value: message.data,
            //             // },
            //             payload: {
            //                 state_value: JSON.parse(message.data)
            //             },
            //             type: 'app/application_state',
            //         });
            //     },
            // });

            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: '/app/application_state',
                messageType: 'std_msgs/String',
                callback: (message: IRosTypeStdMsgsString) => {
                    setDashboardContext({
                        payload: {
                            state_values: JSON.parse(message.data),
                        },
                        type: 'app/application_states',
                    });
                },
            });

            subscriptions.current.subscribeToTopics();
        }

        // Cleanup function to unsubscribe on component unmount
        return () => {
            if (subscriptions.current && !dashboardContext.ra_ros_websocket) {
                subscriptions.current.unsubscribeFromTopics();
            }
        };
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

interface SimpleWebSocketProps {
    websocketUrl: string;
    reconnectInterval?: number; // Time in ms before attempting to reconnect
}

export function RAServerWebSocket(props: SimpleWebSocketProps) {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // useRef to hold the WebSocket instance
    const ws = useRef<WebSocket | null>(null);
    // useRef to track if the component is mounted
    const isMounted = useRef<boolean>(true);
    // useRef for the reconnection timer
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

    // Function to establish WebSocket connection, memoized with useCallback
    const connectWebSocket = useCallback(() => {
        // Prevent multiple connection attempts if already open or connecting
        if (
            ws.current &&
            (ws.current.readyState === WebSocket.OPEN ||
                ws.current.readyState === WebSocket.CONNECTING)
        ) {
            console.log('WebSocket is already open or connecting.');
            return;
        }

        setError(null); // Clear any previous errors
        console.log(
            `Attempting to connect to WebSocket: ${props.websocketUrl}`
        );

        const newWs = new WebSocket(props.websocketUrl);
        ws.current = newWs; // Store the new WebSocket instance

        newWs.onopen = () => {
            if (isMounted.current) {
                setIsConnected(true);
                console.log('WebSocket connected successfully.');
                // Clear any pending reconnection timer on successful connection
                if (reconnectTimer.current) {
                    clearTimeout(reconnectTimer.current);
                    reconnectTimer.current = null;
                }
            }
        };

        newWs.onmessage = (event) => {
            if (isMounted.current) {
                setLastMessage(event.data);
                console.log('Received message:', event.data);
            }
        };

        newWs.onclose = (event) => {
            if (isMounted.current) {
                setIsConnected(false);
                console.warn(
                    'WebSocket disconnected:',
                    event.code,
                    event.reason
                );
                setError(
                    `Disconnected: ${event.reason || 'Unknown reason'}. Reconnecting in ${props.reconnectInterval / 1000}s...`
                );

                // Clear any existing timer to avoid duplicate reconnect attempts
                if (reconnectTimer.current) {
                    clearTimeout(reconnectTimer.current);
                }
                // Set a new timer to attempt reconnection after the specified interval
                reconnectTimer.current = setTimeout(() => {
                    connectWebSocket();
                }, props.reconnectInterval);
            }
        };

        newWs.onerror = (event) => {
            if (isMounted.current) {
                console.error('WebSocket error:', event);
                setError('WebSocket error occurred. See console for details.');
                // Force close to trigger onclose, which then handles reconnection
                newWs.close();
            }
        };
    }, [props.websocketUrl, props.reconnectInterval]); // Dependencies for useCallback

    useEffect(() => {
        isMounted.current = true; // Mark component as mounted

        // Initiate the WebSocket connection when the component mounts
        connectWebSocket();

        // Cleanup function when the component unmounts
        return () => {
            isMounted.current = false; // Mark component as unmounted
            console.log('Cleaning up WebSocket and timers...');
            // Close the WebSocket connection if it's open or connecting
            if (
                ws.current &&
                (ws.current.readyState === WebSocket.OPEN ||
                    ws.current.readyState === WebSocket.CONNECTING)
            ) {
                ws.current.close();
            }
            ws.current = null; // Clear the WebSocket instance
            // Clear any pending reconnection timer
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
        };
    }, [connectWebSocket]); // Dependency array for useEffect

    return <></>;
}
