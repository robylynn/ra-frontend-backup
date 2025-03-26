// Frontend Web Application for RA Products
// Developed by R2 Labs

import { immerable } from 'immer';
import ROSLIB from 'roslib';

import { DatabaseMessageArray } from '@/lib/models/database_models';

import {
    HardwareConfiguration,
    IOPointConfiguration,
    IOPointType,
    UIConfiguration,
} from '@/lib/models/api_models';
import {
    IRosTypeR2CInterfacesAnalogInData,
    IRosTypeR2CInterfacesAnalogInHardwareConfig,
    IRosTypeR2CInterfacesAnalogOutData,
    IRosTypeR2CInterfacesAnalogOutHardwareConfig,
    IRosTypeR2CInterfacesConfigureAnalogInRequest,
    IRosTypeR2CInterfacesConfigureAnalogOutRequest,
    IRosTypeR2CInterfacesConfigureDigitalInRequest,
    IRosTypeR2CInterfacesConfigureDigitalOutRequest,
    IRosTypeR2CInterfacesDigitalInData,
    IRosTypeR2CInterfacesDigitalInHardwareConfig,
    IRosTypeR2CInterfacesDigitalOutData,
    IRosTypeR2CInterfacesDigitalOutHardwareConfig,
    IRosTypeR2CInterfacesEncoderEstimates,
    IRosTypeR2CInterfacesGpioConfigurationState,
    IRosTypeR2CInterfacesSetAnalogOutputStatesRequest,
    IRosTypeR2CInterfacesSetDigitalOutputStatesRequest,
} from '@/lib/models/ros_types';

import timeoutServiceCall from '@/lib/utils/timeoutServiceCall';

type IOServicesMap = Record<IOPointType, ROSLIB.Service | null>;
type IOConfigurationRequest =
    | IRosTypeR2CInterfacesConfigureAnalogInRequest
    | IRosTypeR2CInterfacesConfigureDigitalInRequest
    | IRosTypeR2CInterfacesConfigureAnalogOutRequest
    | IRosTypeR2CInterfacesConfigureDigitalOutRequest;

type IOCommandRequestData =
    | IRosTypeR2CInterfacesSetDigitalOutputStatesRequest
    | IRosTypeR2CInterfacesSetAnalogOutputStatesRequest;

class IOServices {
    [immerable] = true;

    protected _services: IOServicesMap = {
        [IOPointType.DIGITAL_INPUT]: null,
        [IOPointType.DIGITAL_OUTPUT]: null,
        [IOPointType.ANALOG_INPUT]: null,
        [IOPointType.ANALOG_OUTPUT]: null,
        [IOPointType.NULL]: null,
    };

    public constructor() {}

    public get_service(io_point_type: IOPointType) {
        return this._services[io_point_type];
    }

    public set_service(io_point_type: IOPointType, service: ROSLIB.Service) {
        this._services[io_point_type] = service;
    }
}

export class IOCommandServices extends IOServices {
    [immerable] = true;

    private _set_io_point(
        request_data: IOCommandRequestData,
        point_type: IOPointType,
        onSuccess: () => void,
        onFailure: () => void,
        onError: (error: any) => void,
        onComplete: () => void
    ) {
        let success = false;

        const service = this.get_service(point_type);
        if (!service) {
            console.error(
                `Service for IO point type ${IOPointType[point_type]} is not available`
            );
            onFailure();
            return success;
        }

        timeoutServiceCall(service, request_data, 3000)
            .then((result) => {
                if ((result as any).success) {
                    onSuccess();
                    success = true;
                } else {
                    onFailure();
                }
            })
            .catch((error) => {
                onError(error);
            })
            .finally(() => {
                onComplete();
            });
        return success;
    }

    public set_digital_output_point(
        point_index: number,
        state: boolean,
        onSuccess?: () => void,
        onFailure?: () => void,
        onError?: (e: any) => void,
        onComplete?: () => void
    ): boolean {
        let write_channels = new Array<boolean>(8).fill(false);
        write_channels[point_index] = true;

        let request_data: IRosTypeR2CInterfacesSetDigitalOutputStatesRequest;

        let values = new Array<boolean>(8).fill(false);
        values[point_index] = state;
        request_data = {
            states: {
                stamp: { sec: 0, nanosec: 0 },
                write_channels: write_channels,
                values: values,
            },
        };

        return this._set_io_point(
            request_data,
            IOPointType.DIGITAL_OUTPUT,
            () => {
                console.log(
                    `Successfully set digital output ${point_index} to ${state}`
                );
                if (onSuccess) onSuccess();
            },
            () => {
                console.log(
                    `Failed to set digital output ${point_index} to ${state}`
                );
                if (onFailure) onFailure();
            },
            (error) => {
                console.log(
                    `Error setting digital output ${point_index} to ${state}: ${error}`
                );
                if (onError) onError(error);
            },
            () => {
                if (onComplete) onComplete();
            }
        );
    }

    public set_analog_output_point(
        point_index: number,
        state: number,
        onSuccess?: () => void,
        onFailure?: () => void,
        onError?: (e: any) => void,
        onComplete?: () => void
    ): boolean {
        let write_channels = new Array<boolean>(4).fill(false);
        write_channels[point_index] = true;

        let request_data: IRosTypeR2CInterfacesSetAnalogOutputStatesRequest;
        let values = new Array<number>(4).fill(0);

        values[point_index] = state;
        request_data = {
            states: {
                stamp: { sec: 0, nanosec: 0 },
                write_channels: write_channels,
                values: values,
            },
        };

        return this._set_io_point(
            request_data,
            IOPointType.ANALOG_OUTPUT,
            () => {
                console.log(
                    `Successfully set analog output ${point_index} to ${state}`
                );
                if (onSuccess) onSuccess();
            },
            () => {
                console.log(
                    `Failed to set analog output ${point_index} to ${state}`
                );
                if (onFailure) onFailure();
            },
            (error) => {
                console.log(
                    `Error setting analog output ${point_index} to ${state}: ${error}`
                );
                if (onError) onError(error);
            },
            () => {
                if (onComplete) onComplete();
            }
        );
    }
}

export class IOConfigurationServices extends IOServices {
    private _build_service_request(
        io_point_configuration: IOPointConfiguration,
        is_config_request: boolean,
        is_enable_disable_request: boolean
    ): IOConfigurationRequest {
        let request_data: IOConfigurationRequest;

        switch (io_point_configuration.type) {
            case IOPointType.ANALOG_INPUT: {
                request_data = {
                    is_enable_disable_request: is_enable_disable_request,
                    is_config_request: is_config_request,
                    config: {
                        channel: io_point_configuration.channel,
                        hardware_config: {
                            configured: io_point_configuration.configured,
                            enabled: io_point_configuration.enabled,
                            channel_type: io_point_configuration.analog_type,
                        },
                        label: io_point_configuration.label,
                        unit: io_point_configuration.measurement_unit,
                        max_electrical_value:
                            io_point_configuration.max_signal_v,
                        min_electrical_value:
                            io_point_configuration.min_signal_v,
                        max_measurement_value: io_point_configuration.max_value,
                        min_measurement_value: io_point_configuration.min_value,
                        transfer_function_type:
                            io_point_configuration.transfer_function_type,
                    },
                };
                break;
            }
            case IOPointType.ANALOG_OUTPUT: {
                request_data = {
                    is_enable_disable_request: is_enable_disable_request,
                    is_config_request: is_config_request,
                    config: {
                        channel: io_point_configuration.channel,
                        hardware_config: {
                            configured: io_point_configuration.configured,
                            enabled: io_point_configuration.enabled,
                            // channel_type: io_point_configuration.analog_type,
                        },
                        label: io_point_configuration.label,
                        unit: io_point_configuration.measurement_unit,
                        max_electrical_value:
                            io_point_configuration.max_signal_v,
                        min_electrical_value:
                            io_point_configuration.min_signal_v,
                        max_measurement_value: io_point_configuration.max_value,
                        min_measurement_value: io_point_configuration.min_value,
                        transfer_function_type:
                            io_point_configuration.transfer_function_type,
                    },
                };
                break;
            }
            case IOPointType.DIGITAL_INPUT:
            case IOPointType.DIGITAL_OUTPUT: {
                request_data = {
                    is_enable_disable_request: is_enable_disable_request,
                    is_config_request: is_config_request,
                    config: {
                        channel: io_point_configuration.channel,
                        hardware_config: {
                            configured: io_point_configuration.configured,
                            enabled: io_point_configuration.enabled,
                        },
                        label: io_point_configuration.label,
                    },
                };
                break;
            }
        }

        return request_data;
    }

    private _check_service_availability(
        point_type: IOPointType,
        reject: (reason: any) => void,
        onError?: (message: string) => void
    ): ROSLIB.Service | null {
        const service = this.get_service(point_type);
        if (!service) {
            const errorMsg = `Service for point type ${IOPointType[point_type]} not defined`;

            console.error(errorMsg);

            if (onError) onError(errorMsg);
            reject(errorMsg);
        }
        return service;
    }

    private _call_config_service(
        service: ROSLIB.Service,
        request: ROSLIB.ServiceRequest,
        onSuccess?: () => void,
        onError?: (message: string) => void,
        onFailure?: () => void,
        onComplete?: () => void
    ) {
        timeoutServiceCall(service, request, 3000)
            .then((result) => {
                if ((result as any).success) {
                    if (onSuccess) onSuccess();
                } else {
                    const errorMsg = `Configuration service call unsuccessful`;
                    console.error(errorMsg);
                    if (onFailure) onFailure();
                }
            })
            .catch((error) => {
                const errorMsg = `Configuration service call failed: ${error}`;
                console.error(errorMsg);
                if (onError) onError(error);
            })
            .finally(() => {
                if (onComplete) onComplete();
            });
    }

    public enable_io_point(
        io_point_configuration: IOPointConfiguration,
        onSuccess?: () => void,
        onError?: (message: string) => void,
        onFailure?: () => void,
        onComplete?: () => void
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const service = this._check_service_availability(
                io_point_configuration.type,
                reject,
                onError
            );

            const request_data = this._build_service_request(
                io_point_configuration,
                false,
                true
            );
            const request = new ROSLIB.ServiceRequest(request_data);

            this._call_config_service(
                service,
                request,
                () => {
                    console.log(
                        `Successfully enabled IO channel ${io_point_configuration.channel} with type ${IOPointType[io_point_configuration.type]}`
                    );
                    if (onSuccess) onSuccess();
                    resolve();
                },
                (error: any) => {
                    const errorMsg = `Enable/Disable for IO channel ${io_point_configuration.channel} with type ${IOPointType[io_point_configuration.type]} failed: ${error}`;
                    console.info(errorMsg);
                    if (onError) onError(errorMsg);
                    reject(errorMsg);
                },
                () => {
                    const errorMsg = `Enable/Disable for IO channel ${io_point_configuration.channel} with type ${IOPointType[io_point_configuration.type]} unsuccessful`;
                    console.error(errorMsg);
                    if (onFailure) onFailure();
                    reject(errorMsg);
                },
                onComplete
            );
        });
    }

    public configure_io_point(
        io_point_configuration: IOPointConfiguration,
        onSuccess?: () => void,
        onError?: (message: string) => void,
        onFailure?: () => void,
        onComplete?: () => void
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const service = this._check_service_availability(
                io_point_configuration.type,
                reject,
                onError
            );

            const request_data = this._build_service_request(
                io_point_configuration,
                true,
                false
            );
            const request = new ROSLIB.ServiceRequest(request_data);

            this._call_config_service(
                service,
                request,
                () => {
                    console.log(
                        `Successfully enabled IO channel ${io_point_configuration.channel} with type ${IOPointType[io_point_configuration.type]}`
                    );
                    if (onSuccess) onSuccess();
                    resolve;
                },
                (error: any) => {
                    const errorMsg = `Configuration update for IO channel ${io_point_configuration.channel} with type ${IOPointType[io_point_configuration.type]} failed: ${error}`;
                    console.info(errorMsg);
                    if (onError) onError(errorMsg);
                    reject(errorMsg);
                },
                () => {
                    const errorMsg = `Configuration update for IO channel ${io_point_configuration.channel} with type ${IOPointType[io_point_configuration.type]} unsuccessful`;
                    console.error(errorMsg);
                    if (onFailure) onFailure();
                    reject(errorMsg);
                },
                onComplete
            );
        });
    }
}

export class ApplicationContext {
    [immerable] = true;

    // latest_document: DatabaseDocument | null = null;
    messages: DatabaseMessageArray | null = null;
    configuration: UIConfiguration | null = null;
    // io_state: DatabaseIOStateDocumentArray | null = null;
    hardware_configuration: HardwareConfiguration | null = null;
    heartbeat: boolean = false;
    heartbeat_counter: number = 0;
    database_online: boolean = false;
    ra_websocket: WebSocket | null = null;
    ra_ros_websocket: ROSLIB.Ros | null = null;
    io_configuration_services: IOConfigurationServices;
    io_command_services: IOCommandServices;

    // Machine State
    analog_in_data: IRosTypeR2CInterfacesAnalogInData = null;
    analog_out_data: IRosTypeR2CInterfacesAnalogOutData | null = null;
    digital_in_data: IRosTypeR2CInterfacesDigitalInData | null = null;
    digital_out_data: IRosTypeR2CInterfacesDigitalOutData | null = null;
    gpio_configuration_state: IRosTypeR2CInterfacesGpioConfigurationState | null =
        null;

    axis_data: Record<number, IRosTypeR2CInterfacesEncoderEstimates> = {};

    constructor() {
        // this.latest_document = new DatabaseDocument();
        this.configuration = new UIConfiguration();
        this.messages = new DatabaseMessageArray();
        // this.io_state = new DatabaseIOStateDocumentArray();
        this.io_configuration_services = new IOConfigurationServices();
        this.io_command_services = new IOCommandServices();
    }

    public getIOState(point_type: IOPointType) {
        switch (point_type) {
            case IOPointType.ANALOG_INPUT:
                return this.analog_in_data;
            case IOPointType.DIGITAL_INPUT:
                return this.digital_in_data;
            case IOPointType.DIGITAL_OUTPUT:
                return this.digital_out_data;
            case IOPointType.ANALOG_OUTPUT:
                return this.analog_out_data;
        }
    }

    public getGpioConfigurationState(
        point_type: IOPointType
    ):
        | IRosTypeR2CInterfacesDigitalInHardwareConfig[]
        | IRosTypeR2CInterfacesDigitalOutHardwareConfig[]
        | IRosTypeR2CInterfacesAnalogInHardwareConfig[]
        | IRosTypeR2CInterfacesAnalogOutHardwareConfig[]
        | null {
        switch (point_type) {
            case IOPointType.ANALOG_INPUT:
                return this.gpio_configuration_state?.analog_input_configs;
            case IOPointType.DIGITAL_INPUT:
                return this.gpio_configuration_state?.digital_input_configs;
            case IOPointType.DIGITAL_OUTPUT:
                return this.gpio_configuration_state?.digital_output_configs;
            case IOPointType.ANALOG_OUTPUT:
                return this.gpio_configuration_state?.analog_output_configs;
        }
    }
}

export default ApplicationContext;
