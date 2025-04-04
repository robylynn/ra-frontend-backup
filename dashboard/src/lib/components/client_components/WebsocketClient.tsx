// Frontend Web Application for RA Products
// Developed by R2 Labs

'use client';

import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import { IOPointType } from '@/lib/models/api_models';
import {
    ApplicationServices,
    IOCommandServices,
    IOConfigurationServices,
} from '@/lib/models/dashboard_context';
import {
    IRosTypeR2CInterfacesAnalogInData,
    IRosTypeR2CInterfacesAnalogOutData,
    IRosTypeR2CInterfacesApplicationString,
    IRosTypeR2CInterfacesDigitalInData,
    IRosTypeR2CInterfacesDigitalOutData,
    IRosTypeR2CInterfacesEncoderEstimates,
    IRosTypeR2CInterfacesGpioConfigurationState,
} from '@/lib/models/ros_types';
import { getSession } from 'next-auth/react';
import { useContext, useEffect, useRef, useState } from 'react';
import ROSLIB, { Topic } from 'roslib';

function connectWebSocket(url: string, timeout: number): Promise<WebSocket> {
    timeout = timeout || 2000;
    return new Promise(function (resolve, reject) {
        const socket = new WebSocket(url);

        const timer = setTimeout(function () {
            reject(new Error('webSocket timeout'));
            done();
            socket.close();
        }, timeout);

        function done() {
            // cleanup all state here
            clearTimeout(timer);
            socket.removeEventListener('error', error);
        }

        function error(e: Event) {
            reject(e);
            socket.close();
            done();
        }

        socket.addEventListener('open', function () {
            resolve(socket);
            done();
        });
        socket.addEventListener('error', error);
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
    const endpoint_string_service = new ROSLIB.Service({
        ros: ros_websocket,
        name: '/app/set_endpoint',
        serviceType: 'r2c_interfaces/SetApplicationString',
    });

    const application_services: ApplicationServices = new ApplicationServices();
    application_services.set_service('set_endpoint', endpoint_string_service);

    return application_services;
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

    const subscriptions = useRef<Subscriptions | null>();

    const set_ROS_context = (
        config_services: IOConfigurationServices,
        io_state_services: IOCommandServices,
        application_services: ApplicationServices
    ) => {
        setDashboardContext({
            payload: {
                ros_config_services: config_services,
                ros_io_state_services: io_state_services,
                ros_application_services: application_services,
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
                                initializeApplicationServices(socket)
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

            [0, 1, 2, 4].forEach((axis_index) =>
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
                })
            );

            subscriptions.current.add_subscription({
                ros_socket: dashboardContext.ra_ros_websocket,
                name: '/app/callback_payload',
                messageType: 'r2c_interfaces/ApplicationString',
                callback: (message: IRosTypeR2CInterfacesApplicationString) => {
                    setDashboardContext({
                        payload: {
                            state_name: 'callback_payload',
                            state_value: message.payload,
                        },
                        type: 'app/application_state',
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

export function RAServerWebSocket(props: {
    websocket_path: string;
    reconnect_period_seconds: number;
}) {
    // TODO Implement this
    return <></>;
}
