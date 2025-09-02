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
import timeoutServiceCall from '@/lib/utils/timeoutServiceCall';
import { logMessage } from '@/lib/utils/utilities';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';

// Define the properties for the Rosbridge component
// interface RosbridgeWebSocketProps {
//     rosbridgeUrl: string; // e.g., 'ws://localhost:9090'
//     reconnectInterval?: number; // Time in milliseconds before attempting to reconnect (default: 3000ms)
//     //   children?: ReactNode; // Allow children components to interact with the ROS connection
// }

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

interface WebsocketProps {
    websocketUrl: string;
    reconnectInterval?: number; // Time in ms before attempting to reconnect
    callback?: (message: any) => void;
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

export const RosWebsocket: React.FC<WebsocketProps> = ({
    websocketUrl,
    reconnectInterval = 3000,
    //   children,
}) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    // const [error, setError] = useState<string | null>(null);
    // const [debugLog, setDebugLog] = useState<string[]>([]); // To log connection events
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    const ros = useRef<ROSLIB.Ros | null>(null); // ROSLIB.Ros instance
    const isMounted = useRef<boolean>(true);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
    // const subscriptions = useRef<Subscriptions | null>(null);

    // // --- Utility for logging events ---
    // const logDebugMessage = useCallback((message: string) => {
    //     setDebugLog((prevLogs) => {
    //         const newLogs = [
    //             ...prevLogs,
    //             `[${new Date().toLocaleTimeString()}] ${message}`,
    //         ];
    //         return newLogs.slice(-10); // Keep last 10 log entries
    //     });
    //     console.log(`Rosbridge: ${message}`);
    // }, []);

    const setRosContext = (
        config_services: IOConfigurationServices,
        io_state_services: IOCommandServices,
        application_services: ApplicationServices,
        axis_command_services: AxisCommandServices,
        connected?: boolean
    ) => {
        setDashboardContext({
            payload: {
                ros_config_services: config_services,
                ros_io_state_services: io_state_services,
                ros_application_services: application_services,
                ros_axis_command_services: axis_command_services,
                // ra_ros_websocket: ros.current,
                ros_state: {
                    ros: ros.current,
                    connected: connected ?? isConnected,
                },
            },
            type: 'ros/set',
        });
    };

    const clearRosContext = () => {
        if (ros.current) {
            ros.current.removeAllListeners(); // Clean up listeners associated with this instance
            ros.current = null; // Allow a new ROSLIB.Ros instance to be created on next attempt
        }

        setDashboardContext({
            payload: {
                ros_config_services: null,
                ros_io_state_services: null,
                ros_application_services: null,
                // ra_ros_websocket: ros.current,
                ros_state: {
                    ros: ros.current,
                    connected: false,
                },
            },
            type: 'ros/set',
        });
    };

    const configureSubscriptions = () => {
        addSubscription({
            topic: `/gpio/analog_in_electrical_units`,
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

        addSubscription({
            topic: `/gpio/analog_out_electrical_units`,
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

        addSubscription({
            topic: `/gpio/digital_in`,
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

        addSubscription({
            topic: `/gpio/digital_out`,
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

        addSubscription({
            topic: `/gpio/configuration_state`,
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
            addSubscription({
                topic: `/axis_${axis_index}/pos_vel`,
                messageType: 'r2c_interfaces/EncoderEstimates',
                callback: (message: IRosTypeR2CInterfacesEncoderEstimates) => {
                    const data_point: IRosTypeR2CInterfacesEncoderEstimates = {
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

            addSubscription({
                topic: `/axis_${axis_index}/heartbeat`,
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

            addSubscription({
                topic: `/axis_${axis_index}/torque`,
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

        addSubscription({
            topic: '/app/application_state',
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
    };

    // --- ROSLIB.js Connection Logic ---
    const connectRosbridge = useCallback(() => {
        // If a ROSLIB.Ros instance already exists, do nothing.
        // It's either connected, in the process of connecting, or handling a recent disconnection.
        // The reconnection timer will take care of creating a new instance if needed.
        if (ros.current) {
            logMessage(
                'ROSLIB instance already exists; connection state managed internally.',
                'debug'
            );
            return;
        }

        // setError(null); // Clear previous errors
        logMessage(
            `Attempting to connect to Rosbridge: ${websocketUrl}`,
            'debug'
        );

        // Create a new ROSLIB.Ros instance
        const newRos = new ROSLIB.Ros({
            url: websocketUrl,
        });
        ros.current = newRos;

        newRos.on('connection', () => {
            // Event when connected
            if (isMounted.current) {
                // setIsConnected(true);
                // logDebugMessage('Connected to Rosbridge successfully.');
                // Clear any pending reconnection timer on successful connection
                if (reconnectTimer.current) {
                    clearTimeout(reconnectTimer.current);
                    reconnectTimer.current = null;
                }

                // Check available nodes to see if we are connected
                const nodes_service = new ROSLIB.Service({
                    ros: newRos,
                    name: '/rosapi/nodes',
                    serviceType: 'rosapi_msgs/srv/Nodes',
                });
                timeoutServiceCall(nodes_service, {}, reconnectInterval / 2)
                    .then(
                        (nodes) => {
                            logMessage(
                                `Found ROS nodes: ${JSON.stringify(nodes)}`,
                                'info'
                            );
                            return true;
                        },
                        (error) => {
                            logMessage(
                                `Failed to find any ROS nodes. Is the ROS backend running? Error: ${error}`,
                                'error'
                            );
                            return false;
                        }
                    )
                    .then((res) => {
                        if (res) {
                            setIsConnected(true);
                            logMessage('Connected to Rosbridge successfully.');

                            configureSubscriptions();

                            setRosContext(
                                initializeIOConfigurationServices(ros.current),
                                initializeIOCommandServices(ros.current),
                                initializeApplicationServices(ros.current),
                                initializeAxisServices(ros.current),
                                true
                            );
                        } else {
                            clearRosContext();

                            if (reconnectTimer.current) {
                                clearTimeout(reconnectTimer.current);
                            }
                            reconnectTimer.current = setTimeout(() => {
                                connectRosbridge(); // Reattempt connection by calling this function again
                            }, reconnectInterval);
                        }
                    });
            }
        });

        newRos.on('error', (rosError) => {
            // Event on error
            if (isMounted.current) {
                console.error('ROSLIB.Ros error:', rosError);
                // ROSLIB.js errors often lead to a 'close' event, so we rely on 'close' for reconnection.
                // Just log the error here.
                // setError('ROSLIB connection error. Check console for details.');
                logMessage(
                    `ROSLIB error: ${JSON.stringify(rosError)}`,
                    'error'
                );

                setIsConnected(false);
                clearRosContext();
            }
        });

        newRos.on('close', () => {
            // Event when disconnected
            if (isMounted.current) {
                setIsConnected(false);
                clearRosContext();
                logMessage(
                    `Disconnected from Rosbridge. Reconnecting in ${reconnectInterval / 1000}s...`
                );
                // setError(`Disconnected from ROSbridge.`);

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
    }, [websocketUrl, reconnectInterval]);

    // --- Effect for mounting and unmounting ---
    useEffect(() => {
        isMounted.current = true; // Component is mounted
        connectRosbridge(); // Initiate connection

        // Cleanup function when component unmounts
        return () => {
            isMounted.current = false; // Mark as unmounted
            logMessage(
                'Component unmounted. Cleaning up ROSLIB.Ros connection.',
                'debug'
            );
            if (ros.current) {
                ros.current.close(); // Close the ROSLIB.Ros connection
                ros.current.removeAllListeners(); // Ensure all listeners are cleaned up
            }
            ros.current = null;
            clearRosContext();
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
        };
    }, [connectRosbridge]);

    // --- Functions to manage Subscriptions and Service Clients ---
    const addSubscription = useCallback(
        (sub: RosSubscription) => {
            if (ros.current && ros.current.isConnected) {
                logMessage(
                    `Adding subscription to topic: ${sub.topic}`,
                    'debug'
                );
                const listener = new ROSLIB.Topic({
                    ros: ros.current,
                    name: sub.topic,
                    messageType: sub.messageType,
                });
                listener.subscribe(sub.callback);
                return listener; // Return the listener to allow for unsubscribing
            } else {
                logMessage(
                    `Cannot add subscription for ${sub.topic}: Not connected.`,
                    'warning'
                );
                return null;
            }
        },
        // [logDebugMessage]
        []
    );

    const removeSubscription = useCallback(
        (listener: ROSLIB.Topic) => {
            if (listener) {
                logMessage(
                    `Removing subscription from topic: ${listener.name}`,
                    'debug'
                );
                listener.unsubscribe();
            }
        },
        // [logDebugMessage]
        []
    );

    const callServiceClient = useCallback(
        (
            client: RosServiceClient,
            request: any,
            onResponse: (result: any) => void,
            onError: (errorMsg: string) => void
        ) => {
            if (ros.current && ros.current.isConnected) {
                logMessage(`Calling service: ${client.name}`, 'debug');
                const serviceClient = new ROSLIB.Service({
                    ros: ros.current,
                    name: client.name,
                    serviceType: client.serviceType,
                });
                const rosRequest = new ROSLIB.ServiceRequest(request);
                serviceClient.callService(rosRequest, onResponse, onError);
            } else {
                logMessage(
                    `Cannot call service ${client.name}: Not connected.`,
                    'error'
                );
                onError('Not connected to Rosbridge.');
            }
        },
        // [logDebugMessage]
        []
    );

    return <></>;
};

// export function RAServerWebSocket(props: WebsocketProps) {
//     const [isConnected, setIsConnected] = useState<boolean>(false);
//     const [lastMessage, setLastMessage] = useState<string | null>(null);
//     const [error, setError] = useState<string | null>(null);

//     // useRef to hold the WebSocket instance
//     const ws = useRef<WebSocket | null>(null);
//     // useRef to track if the component is mounted
//     const isMounted = useRef<boolean>(true);
//     // useRef for the reconnection timer
//     const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

//     // Function to establish WebSocket connection, memoized with useCallback
//     const connectWebSocket = useCallback(() => {
//         // Prevent multiple connection attempts if already open or connecting
//         if (
//             ws.current &&
//             (ws.current.readyState === WebSocket.OPEN ||
//                 ws.current.readyState === WebSocket.CONNECTING)
//         ) {
//             console.log('WebSocket is already open or connecting.');
//             return;
//         }

//         setError(null); // Clear any previous errors
//         console.log(
//             `Attempting to connect to WebSocket: ${props.websocketUrl}`
//         );

//         const newWs = new WebSocket(props.websocketUrl);
//         ws.current = newWs; // Store the new WebSocket instance

//         newWs.onopen = () => {
//             if (isMounted.current) {
//                 setIsConnected(true);
//                 console.log('WebSocket connected successfully.');
//                 // Clear any pending reconnection timer on successful connection
//                 if (reconnectTimer.current) {
//                     clearTimeout(reconnectTimer.current);
//                     reconnectTimer.current = null;
//                 }
//             }
//         };

//         newWs.onmessage = (event) => {
//             if (isMounted.current) {
//                 setLastMessage(event.data);
//                 console.log('Received message:', event.data);
//                 props.callback?.(event.data);
//             }
//         };

//         newWs.onclose = (event) => {
//             if (isMounted.current) {
//                 setIsConnected(false);
//                 console.warn(
//                     'WebSocket disconnected:',
//                     event.code,
//                     event.reason
//                 );
//                 setError(
//                     `Disconnected: ${event.reason || 'Unknown reason'}. Reconnecting in ${props.reconnectInterval / 1000}s...`
//                 );

//                 // Clear any existing timer to avoid duplicate reconnect attempts
//                 if (reconnectTimer.current) {
//                     clearTimeout(reconnectTimer.current);
//                 }
//                 // Set a new timer to attempt reconnection after the specified interval
//                 reconnectTimer.current = setTimeout(() => {
//                     connectWebSocket();
//                 }, props.reconnectInterval);
//             }
//         };

//         newWs.onerror = (event) => {
//             if (isMounted.current) {
//                 console.error('WebSocket error:', event);
//                 setError('WebSocket error occurred. See console for details.');
//                 // Force close to trigger onclose, which then handles reconnection
//                 newWs.close();
//             }
//         };
//     }, [props.websocketUrl, props.reconnectInterval]); // Dependencies for useCallback

//     useEffect(() => {
//         isMounted.current = true; // Mark component as mounted

//         // Initiate the WebSocket connection when the component mounts
//         connectWebSocket();

//         // Cleanup function when the component unmounts
//         return () => {
//             isMounted.current = false; // Mark component as unmounted
//             console.log('Cleaning up WebSocket and timers...');
//             // Close the WebSocket connection if it's open or connecting
//             if (
//                 ws.current &&
//                 (ws.current.readyState === WebSocket.OPEN ||
//                     ws.current.readyState === WebSocket.CONNECTING)
//             ) {
//                 ws.current.close();
//             }
//             ws.current = null; // Clear the WebSocket instance
//             // Clear any pending reconnection timer
//             if (reconnectTimer.current) {
//                 clearTimeout(reconnectTimer.current);
//                 reconnectTimer.current = null;
//             }
//         };
//     }, [connectWebSocket]); // Dependency array for useEffect

//     return <></>;
// }
