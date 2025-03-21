// Frontend Web Application for RA Products
// Developed by R2 Labs

import { immerable } from 'immer';
import ROSLIB from 'roslib';

import {
    // DatabaseIOStateDocumentArray,
    DatabaseMessageArray,
} from '@/lib/models/database_models';

import {
    HardwareConfiguration,
    IOPointType,
    UIConfiguration,
} from '@/lib/models/api_models';
import {
    IRosTypeR2CInterfacesAnalogInData,
    IRosTypeR2CInterfacesAnalogInHardwareConfig,
    IRosTypeR2CInterfacesAnalogOutData,
    IRosTypeR2CInterfacesAnalogOutHardwareConfig,
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
        request_data:
            | IRosTypeR2CInterfacesSetDigitalOutputStatesRequest
            | IRosTypeR2CInterfacesSetAnalogOutputStatesRequest,
        service: ROSLIB.Service,
        onSuccess: () => void,
        onFailure: () => void,
        onError: (error: any) => void,
        onComplete: () => void
    ) {
        let success = false;
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
            this.get_service(IOPointType.DIGITAL_OUTPUT),
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
            this.get_service(IOPointType.ANALOG_OUTPUT),
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

export class IOConfigurationServices extends IOServices {}

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
        | IRosTypeR2CInterfacesAnalogOutHardwareConfig[] | null {
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
