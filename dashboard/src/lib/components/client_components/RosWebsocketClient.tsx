// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import {
    AITrainingServiceType,
    AxisServiceType,
    CameraServiceType,
    IOPointType,
} from '@/lib/models/api_models';
import {
    AITrainingCommandServices,
    ApplicationServices,
    AxisCommandServices,
    CameraCommandServices,
    IOServices,
    // IOCommandServices,
    // IOConfigurationServices,
    OPCUAServices,
    RosServices,
} from '@/lib/models/dashboard_context';
import {
    IRosTypeR2CInterfacesAnalogInData,
    IRosTypeR2CInterfacesAnalogOutData,
    IRosTypeR2CInterfacesDigitalInData,
    IRosTypeR2CInterfacesDigitalOutData,
    IRosTypeR2CInterfacesEncoderEstimates,
    IRosTypeR2CInterfacesGpioConfigurationState,
    IRosTypeR2CInterfacesHeartbeat,
    IRosTypeR2CInterfacesIoSystemState,
    IRosTypeR2CInterfacesOpcuaData,
    IRosTypeR2CInterfacesTorques,
    IRosTypeStdMsgsString,
} from '@/lib/models/ros_types';
import timeoutServiceCall from '@/lib/utils/timeoutServiceCall';
import { logMessage } from '@/lib/utils/utilities';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ROSLIB from 'roslib';

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

// function initializeIOConfigurationServices(
//     ros_websocket: ROSLIB.Ros
// ): IOConfigurationServices {
//     const digital_in_config_service = new ROSLIB.Service({
//         ros: ros_websocket,
//         name: '/configure_digital_in',
//         serviceType: 'r2c_interfaces/ConfigureDigitalIn',
//     });

//     const digital_out_config_service = new ROSLIB.Service({
//         ros: ros_websocket,
//         name: '/configure_digital_out',
//         serviceType: 'r2c_interfaces/ConfigureDigitalOut',
//     });

//     const analog_in_config_service = new ROSLIB.Service({
//         ros: ros_websocket,
//         name: '/configure_analog_in',
//         serviceType: 'r2c_interfaces/ConfigureAnalogIn',
//     });

//     const analog_out_config_service = new ROSLIB.Service({
//         ros: ros_websocket,
//         name: '/configure_analog_out',
//         serviceType: 'r2c_interfaces/ConfigureAnalogOut',
//     });

//     let config_services: IOConfigurationServices =
//         new IOConfigurationServices();
//     config_services.set_service(
//         IOPointType.ANALOG_INPUT,
//         analog_in_config_service
//     );
//     config_services.set_service(
//         IOPointType.ANALOG_OUTPUT,
//         analog_out_config_service
//     );
//     config_services.set_service(
//         IOPointType.DIGITAL_INPUT,
//         digital_in_config_service
//     );
//     config_services.set_service(
//         IOPointType.DIGITAL_OUTPUT,
//         digital_out_config_service
//     );

//     return config_services;
// }

// function initializeIOCommandServices(
//     ros_websocket: ROSLIB.Ros
// ): IOCommandServices {
//     const digital_out_command_service = new ROSLIB.Service({
//         ros: ros_websocket,
//         name: '/gpio/set_digital_out',
//         serviceType: 'r2c_interfaces/SetDigitalOutputStates',
//     });

//     const analog_out_command_service = new ROSLIB.Service({
//         ros: ros_websocket,
//         name: '/gpio/set_analog_out',
//         serviceType: 'r2c_interfaces/SetAnalogOutputStates',
//     });

//     let io_state_services: IOCommandServices = new IOCommandServices();
//     io_state_services.set_service(
//         IOPointType.DIGITAL_OUTPUT,
//         digital_out_command_service
//     );

//     io_state_services.set_service(
//         IOPointType.ANALOG_OUTPUT,
//         analog_out_command_service
//     );

//     return io_state_services;
// }

function initializeCameraServices(
    ros_websocket: ROSLIB.Ros
): CameraCommandServices {
    const camera_start_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/camera/start_stream',
        serviceType: 'r2c_interfaces/ConfigureCameraStream',
    });

    const camera_stop_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/camera/stop_stream',
        serviceType: 'r2c_interfaces/ConfigureCameraStream',
    });

    const camera_detect_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/camera/detect_cameras',
        serviceType: 'r2c_interfaces/DetectCameras',
    });

    const camera_enable_ai_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/camera/enable_ai',
        serviceType: 'r2c_interfaces/ToggleAI',
    });

    const camera_services = new CameraCommandServices();
    camera_services.set_service(
        CameraServiceType.START_STREAM,
        camera_start_service
    );
    camera_services.set_service(
        CameraServiceType.STOP_STREAM,
        camera_stop_service
    );
    camera_services.set_service(
        CameraServiceType.DETECT_CAMERAS,
        camera_detect_service
    );
    camera_services.set_service(
        CameraServiceType.ENABLE_AI,
        camera_enable_ai_service
    );

    return camera_services;
}

function initializeAITrainingServices(
    ros_websocket: ROSLIB.Ros
): AITrainingCommandServices {
    // Service for getting projects
    const ai_get_projects_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/training/get_projects',
        serviceType: 'r2c_interfaces/srv/GetAIProjects',
    });

    // Service for starting training
    const ai_start_training_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/training/start_training',
        serviceType: 'r2c_interfaces/srv/ConfigureAITraining',
    });

    const ai_training_services = new AITrainingCommandServices();

    // Set the services
    ai_training_services.set_service(
        AITrainingServiceType.GET_PROJECTS,
        ai_get_projects_service
    );

    ai_training_services.set_service(
        AITrainingServiceType.START_TRAINING,
        ai_start_training_service
    );

    return ai_training_services;
}

function initializeApplicationServices(
    ros_websocket: ROSLIB.Ros
): ApplicationServices {
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
}) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const { dashboardContext, setDashboardContext } =
        useContext(DashboardContext);

    const ros = useRef<ROSLIB.Ros | null>(null); // ROSLIB.Ros instance
    const isMounted = useRef<boolean>(true);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

    const setRosContext = (
        // config_services: IOConfigurationServices,
        // io_state_services: IOCommandServices,
        // // application_services: ApplicationServices,
        // axis_command_services: AxisCommandServices,
        // camera_services: CameraCommandServices,
        services: RosServices,
        connected?: boolean
    ) => {
        setDashboardContext({
            payload: {
                // ros_config_services: config_services,
                // ros_io_state_services: io_state_services,
                // // ros_application_services: application_services,
                // ros_axis_command_services: axis_command_services,
                // ros_camera_services: camera_services,
                services: services,
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
                // ros_config_services: null,
                // ros_io_state_services: null,
                services: null,
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

        addSubscription({
            topic: '/opc/subscription_data',
            messageType: 'r2c_interfaces/OPCUAData',
            callback: (message: IRosTypeR2CInterfacesOpcuaData) => {
                logMessage(
                    `Got OPC data update: ${JSON.stringify(message)}`,
                    'debug',
                    'ROS'
                );
                setDashboardContext({
                    payload: message,
                    type: 'opc/data/set',
                });
            },
        });

        addSubscription({
            topic: '/modbus/io_system_state',
            messageType: 'r2c_interfaces/IOSystemState',
            callback: (message: IRosTypeR2CInterfacesIoSystemState) => {
                logMessage(
                    `Got IO data update: ${JSON.stringify(message)}`,
                    'info',
                    'ROS'
                );
                setDashboardContext({
                    payload: message,
                    type: 'modbus_io/data/set',
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

                            const services: RosServices = {
                                application_services:
                                    initializeApplicationServices(ros.current),
                                opc_services: new OPCUAServices(ros.current),
                                camera_services: initializeCameraServices(
                                    ros.current
                                ),
                                ai_training_services: initializeAITrainingServices(ros.current),
                                io_services: new IOServices(ros.current)
                            };

                            setRosContext(
                                services,
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
                'debug',
                'ROS'
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
                    'debug',
                    'ROS'
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
                    'warning',
                    'ROS'
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
                    'debug',
                    'ROS'
                );
                listener.unsubscribe();
            }
        },
        // [logDebugMessage]
        []
    );

    // const callServiceClient = useCallback(
    //     (
    //         client: RosServiceClient,
    //         request: any,
    //         onResponse: (result: any) => void,
    //         onError: (errorMsg: string) => void
    //     ) => {
    //         if (ros.current && ros.current.isConnected) {
    //             logMessage(`Calling service: ${client.name}`, 'debug');
    //             const serviceClient = new ROSLIB.Service({
    //                 ros: ros.current,
    //                 name: client.name,
    //                 serviceType: client.serviceType,
    //             });
    //             const rosRequest = new ROSLIB.ServiceRequest(request);
    //             serviceClient.callService(rosRequest, onResponse, onError);
    //         } else {
    //             logMessage(
    //                 `Cannot call service ${client.name}: Not connected.`,
    //                 'error'
    //             );
    //             onError('Not connected to Rosbridge.');
    //         }
    //     },
    //     // [logDebugMessage]
    //     []
    // );

    return <></>;
};

export function useRos() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        // throw new Error('useWebSocket must be used within a WebSocketProvider');
        return {
            subscribeToTopic: (topic: string) => {},
            // isInitialized: false,
            // isConnected: false,
            // clientId: null,
            // // isConnected,
            // // clientId,
            // subscribedTables: [],
            // subscribe: (
            //     tableName: string,
            //     sendHistorical?: boolean,
            //     historicalLimit?: number
            // ) => {},
            // unsubscribe: (tableName: string) => {},
            // // New: Function to register callbacks for specific messages
            // registerMessageListener:
            //     (
            //         listenerId: string,
            //         callback: (message: WebSocketMessage) => void,
            //         filter?: WebSocketMessageFilter
            //     ) =>
            //     () => {}, // Returns an unregister function
        };
    }
    return context;
}
