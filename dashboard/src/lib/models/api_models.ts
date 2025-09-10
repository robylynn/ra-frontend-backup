// Frontend Web Application for RA Products
// Developed by R2 Labs

import {
    IRosTypeR2CInterfacesAnalogInConfigConst,
    IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType,
    IRosTypeR2CInterfacesAnalogOutConfigConst,
} from '@/lib/models/ros_types';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export interface BackendAPIResponseInterface {
    error: boolean;
    data: string | Array<any> | any;
    error_details?: BackendAPIErrorDetailsInterface;
}

export interface BackendAPIErrorDetailsInterface {
    description: string;
    details?: string;
    stderr?: string;
}

export interface NextAPIResponseInterface {
    authenticated: boolean;
    backend_response?: BackendAPIResponseInterface;
    proxy_error?: boolean;
    proxy_error_string?: string;
}

export function createAPIResponse(res: NextAPIResponseInterface) {
    return NextResponse.json(res);
}

////////////////////////////////////////////////
//////////// HARDWARE CONFIGURATION ////////////
////////////////////////////////////////////////

export enum IOPointType {
    NULL,
    // ANALOG_VOLTAGE_INPUT,
    // ANALOG_CURRENT_INPUT,
    // ANALOG_VOLTAGE_OUTPUT,
    // ANALOG_CURRENT_OUTPUT,
    ANALOG_INPUT,
    ANALOG_OUTPUT,
    DIGITAL_INPUT,
    DIGITAL_OUTPUT,
}

export enum AxisDataType {
    NULL,
    VELOCITY,
    POSITION,
}

export const IOPointTypeFriendlyName: Record<IOPointType, string> = {
    [IOPointType.NULL]: 'Null',
    [IOPointType.ANALOG_INPUT]: 'Analog Input',
    [IOPointType.ANALOG_OUTPUT]: 'Analog Output',
    [IOPointType.DIGITAL_INPUT]: 'Digital Input',
    [IOPointType.DIGITAL_OUTPUT]: 'Digital Output',
};

export enum AnalogIOPointType {
    VOLTAGE,
    CURRENT,
}

export enum AxisServiceType {
    SET_STATE,
    CLEAR_ERRORS,
    JOG,
}

// export enum TransferFunctionType {
//   LINEAR,
//   CUSTOM,
// }

export class HardwareComponentConfiguration {
    public get identifier(): number {
        return 0;
    }
}

export interface AxisConfigurationInterface {
    label: string;
    index: number;
}

export class AxisConfiguration
    extends HardwareComponentConfiguration
    implements AxisConfigurationInterface
{
    label: string;
    index: number;

    constructor(input?: AxisConfigurationInterface) {
        super();
        if (input) {
            Object.assign(this, input);
        }
    }

    public get identifier(): number {
        return this.index;
    }
}

export interface IOPointConfigurationInterface {
    id?: string;
    channel: number;
    type: IOPointType;
    analog_type?: IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType;
    enabled: boolean;
    configured: boolean;
    label?: string;
    transfer_function_type?:
        | IRosTypeR2CInterfacesAnalogInConfigConst
        | IRosTypeR2CInterfacesAnalogOutConfigConst;
    measurement_unit?: string;
    min_value?: number;
    min_signal_v?: number;
    max_value?: number;
    max_signal_v?: number;
    value?: any;
}

export class IOPointConfiguration
    extends HardwareComponentConfiguration
    implements IOPointConfigurationInterface
{
    private _mcu_configuration_valid: boolean;

    id: string;
    channel: number;
    type: IOPointType;
    analog_type?: IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType;
    enabled: boolean;
    configured: boolean;
    label: string;
    transfer_function_type?:
        | IRosTypeR2CInterfacesAnalogInConfigConst
        | IRosTypeR2CInterfacesAnalogOutConfigConst;
    measurement_unit: string;
    min_value: number;
    min_signal_v: number;
    max_value: number;
    max_signal_v: number;
    value: any;

    constructor(input?: IOPointConfigurationInterface) {
        super();
        if (input) {
            this._mcu_configuration_valid = false;

            this.id = input.id;
            this.channel = input.channel;
            this.label = input.label ?? '';
            this.enabled = input.enabled ?? false;
            this.configured = input.configured;
            this.type =
                typeof input.type === 'string'
                    ? IOPointType[
                          (input.type ?? 'NULL') as keyof typeof IOPointType
                      ]
                    : (input.type as IOPointType);

            if (
                this.type == IOPointType.ANALOG_INPUT ||
                this.type == IOPointType.ANALOG_OUTPUT
            ) {
                this.analog_type =
                    typeof input.analog_type === 'string'
                        ? IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType[
                              (input.analog_type ??
                                  'NULL') as keyof typeof IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType
                          ]
                        : (input.analog_type as IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType);
            }

            this.measurement_unit = input.measurement_unit ?? '';
            this.min_value = input.min_value ?? 0;
            this.max_value = input.max_value ?? 0;
            this.min_signal_v = input.min_signal_v ?? 0;
            this.max_signal_v = input.max_signal_v ?? 0;

            if (this.type == IOPointType.ANALOG_INPUT) {
                this.transfer_function_type =
                    typeof input.type === 'string'
                        ? IRosTypeR2CInterfacesAnalogInConfigConst[
                              (input.type ??
                                  'NULL') as keyof typeof IRosTypeR2CInterfacesAnalogInConfigConst
                          ]
                        : (input.transfer_function_type as IRosTypeR2CInterfacesAnalogInConfigConst);
            } else if (this.type == IOPointType.ANALOG_OUTPUT) {
                this.transfer_function_type =
                    typeof input.type === 'string'
                        ? IRosTypeR2CInterfacesAnalogOutConfigConst[
                              (input.type ??
                                  'NULL') as keyof typeof IRosTypeR2CInterfacesAnalogOutConfigConst
                          ]
                        : (input.transfer_function_type as IRosTypeR2CInterfacesAnalogOutConfigConst);
            }

            this.value = input.value;
        }
    }

    public static DefaultAnalogInputConfiguration(point_index?: number) {
        return new IOPointConfiguration({
            id: '',
            label: 'Analog Input',
            type: IOPointType.ANALOG_INPUT,
            analog_type:
                IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType.CHANNEL_TYPE_VOLTAGE,
            channel: point_index ?? 0,
            configured: true,
            transfer_function_type:
                IRosTypeR2CInterfacesAnalogInConfigConst.TRANSFER_FUNCTION_LINEAR,
            measurement_unit: '',
            min_value: 0,
            min_signal_v: 0,
            max_value: 0,
            max_signal_v: 0,
            value: 0,
            enabled: false,
        });
    }

    public static DefaultAnalogOutputConfiguration(point_index?: number) {
        return new IOPointConfiguration({
            id: '',
            label: 'Analog Output',
            type: IOPointType.ANALOG_OUTPUT,
            analog_type:
                IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType.CHANNEL_TYPE_VOLTAGE,
            channel: point_index ?? 0,
            configured: true,
            transfer_function_type:
                IRosTypeR2CInterfacesAnalogInConfigConst.TRANSFER_FUNCTION_LINEAR,
            measurement_unit: '',
            min_value: 0,
            min_signal_v: 0,
            max_value: 0,
            max_signal_v: 0,
            value: 0,
            enabled: false,
        });
    }

    public static DefaultDigitalInputConfiguration(point_index?: number) {
        return new IOPointConfiguration({
            id: '',
            label: 'Digital Input',
            type: IOPointType.DIGITAL_INPUT,
            channel: point_index ?? 0,
            configured: true,
            measurement_unit: '',
            min_value: 0,
            min_signal_v: 0,
            max_value: 0,
            max_signal_v: 0,
            value: 0,
            enabled: false,
        });
    }

    public static DefaultDigitalOutputConfiguration(point_index?: number) {
        return new IOPointConfiguration({
            id: '',
            label: 'Digital Output',
            type: IOPointType.DIGITAL_OUTPUT,
            channel: point_index ?? 0,
            configured: true,
            measurement_unit: '',
            min_value: 0,
            min_signal_v: 0,
            max_value: 0,
            max_signal_v: 0,
            value: 0,
            enabled: false,
        });
    }

    public static DefaultIOPointConfiguration(
        point_type: IOPointType,
        point_index?: number
    ) {
        switch (point_type) {
            case IOPointType.DIGITAL_INPUT:
                return this.DefaultDigitalInputConfiguration(point_index);
            case IOPointType.DIGITAL_OUTPUT:
                return this.DefaultDigitalOutputConfiguration(point_index);
            case IOPointType.ANALOG_INPUT:
                return this.DefaultAnalogInputConfiguration(point_index);
            case IOPointType.ANALOG_OUTPUT:
                return this.DefaultAnalogOutputConfiguration(point_index);
        }
    }

    public get identifier(): number {
        return this.channel;
    }

    public get mcu_configuration_valid(): boolean {
        return this._mcu_configuration_valid;
    }

    public set mcu_configuration_valid(configuration_valid: boolean) {
        this._mcu_configuration_valid = configuration_valid;
    }

    public copy(): IOPointConfiguration {
        let copied_configuration = new IOPointConfiguration();
        Object.assign(copied_configuration, this);
        return copied_configuration;
    }
}

export interface IOConfigurationInterface {
    digital_inputs: Array<IOPointConfigurationInterface>;
    digital_outputs: Array<IOPointConfigurationInterface>;
    analog_inputs: Array<IOPointConfigurationInterface>;
    analog_outputs: Array<IOPointConfigurationInterface>;
}

export class IOConfiguration implements IOConfigurationInterface {
    private configuration_constants: Record<IOPointType, number> = {
        [IOPointType.DIGITAL_INPUT]: 8,
        [IOPointType.DIGITAL_OUTPUT]: 8,
        [IOPointType.ANALOG_INPUT]: 3,
        [IOPointType.ANALOG_OUTPUT]: 8,
        [IOPointType.NULL]: 8,
    };

    digital_inputs: Array<IOPointConfiguration> = [];
    digital_outputs: Array<IOPointConfiguration> = [];
    analog_inputs: Array<IOPointConfiguration> = [];
    analog_outputs: Array<IOPointConfiguration> = [];

    initialized: boolean = false;

    public copy(): IOConfiguration {
        let config = new IOConfiguration();
        Object.assign(config, this);
        return config;
    }

    constructor(input?: IOConfigurationInterface) {
        input?.digital_inputs?.forEach((i) => {
            this.digital_inputs.push(new IOPointConfiguration(i));
            this.initialized = true;
        });

        input?.digital_outputs?.forEach((o) => {
            this.digital_outputs.push(new IOPointConfiguration(o));
            this.initialized = true;
        });

        input?.analog_inputs?.forEach((i) => {
            this.analog_inputs.push(new IOPointConfiguration(i));
            this.initialized = true;
        });

        input?.analog_outputs?.forEach((o) => {
            this.analog_outputs.push(new IOPointConfiguration(o));
            this.initialized = true;
        });

        this.configuration_constants = {
            [IOPointType.DIGITAL_INPUT]: 8,
            [IOPointType.DIGITAL_OUTPUT]: 8,
            [IOPointType.ANALOG_INPUT]: 3,
            [IOPointType.ANALOG_OUTPUT]: 8,
            [IOPointType.NULL]: 8,
        };
    }

    public assignUUIDs() {
        this.analog_inputs.forEach((p) => {
            p.id = uuidv4();
        });

        this.analog_outputs.forEach((p) => {
            p.id = uuidv4();
        });

        this.digital_inputs.forEach((p) => {
            p.id = uuidv4();
        });

        this.digital_outputs.forEach((p) => {
            p.id = uuidv4();
        });
    }

    public getMaximumChannels(point_type: IOPointType): number {
        return this.configuration_constants[point_type];
    }

    public getIOPoints(point_type: IOPointType): Array<IOPointConfiguration> {
        switch (point_type) {
            case IOPointType.DIGITAL_INPUT:
                return this.digital_inputs;
            case IOPointType.DIGITAL_OUTPUT:
                return this.digital_outputs;
            case IOPointType.ANALOG_INPUT:
                return this.analog_inputs;
            case IOPointType.ANALOG_OUTPUT:
                return this.analog_outputs;
            default:
                return []; //new Array<IOPointConfiguration>();
        }
    }

    public getConfiguredIOPoints(
        point_type: IOPointType
    ): Array<IOPointConfiguration> {
        return this.getIOPoints(point_type).filter((p) => p.configured);
    }

    public getConfiguredAndEnabledIOPoints(
        point_type: IOPointType
    ): Array<IOPointConfiguration> {
        return this.getIOPoints(point_type).filter(
            (p) => p.configured && p.enabled
        );
    }

    public insertPoint(point: IOPointConfiguration) {
        switch (point.type) {
            case IOPointType.DIGITAL_INPUT:
                this.digital_inputs.push(point);
                break;
            case IOPointType.DIGITAL_OUTPUT:
                this.digital_outputs.push(point);
                break;
            case IOPointType.ANALOG_INPUT:
                this.analog_inputs.push(point);
                break;
            case IOPointType.ANALOG_OUTPUT:
                this.analog_outputs.push(point);
                break;
            default:
                break;
        }
    }

    public getPointByIndex(
        point_type: IOPointType,
        index: number
    ): IOPointConfiguration | null {
        try {
            switch (point_type) {
                case IOPointType.DIGITAL_INPUT:
                    return this.digital_inputs[index];
                // this.digital_inputs.push(point)
                case IOPointType.DIGITAL_OUTPUT:
                    return this.digital_inputs[index];
                case IOPointType.ANALOG_INPUT:
                    return this.analog_inputs[index];
                case IOPointType.ANALOG_OUTPUT:
                    return this.analog_outputs[index];
                default:
                    return null; //new Array<IOPointConfiguration>();
            }
        } catch (e) {
            console.log(
                `Point index ${index} with type ${IOPointType[point_type]} does not exist`
            );
            return null;
        }
    }

    public channelExists(
        pointArray: Array<IOPointConfiguration | null>,
        channelLookup: number
    ) {
        // return if channel exists
        return pointArray.some((p) => p?.channel === channelLookup);
    }

    public getPointIndexByChannel(
        pointArray: Array<IOPointConfiguration | null>,
        channel: number
    ) {
        /// return first null index if channel number doesn't exist in array, otherwise, return index of existing
        try {
            const channelExists = this.channelExists(pointArray, channel);
            if (channelExists) {
                const updateIndex = pointArray.findIndex(
                    (p) => p?.channel === channel
                );
                return updateIndex;
            }

            // If the channel does not exist, return the first available slot (null)
            const firstNullIndex = pointArray.findIndex(
                (p) => p.channel === null
            );
            return firstNullIndex;
        } catch (e) {
            console.error(`Point channel ${channel} does not exist`);
            return -1;
        }
    }

    public getIOArrayByType(point_type: IOPointType) {
        switch (point_type) {
            case IOPointType.DIGITAL_INPUT:
                return [this.digital_inputs, 'digital_inputs'];
            case IOPointType.DIGITAL_OUTPUT:
                return [this.digital_outputs, 'digital_outputs'];
            case IOPointType.ANALOG_INPUT:
                return [this.analog_inputs, 'analog_inputs'];
            case IOPointType.ANALOG_OUTPUT:
                return [this.analog_outputs, 'analogs_outputs'];
            default:
                return [];
        }
    }

    public insertPointByIndex(point: IOPointConfiguration, index: number) {
        switch (point.type) {
            case IOPointType.DIGITAL_INPUT:
                this.digital_inputs[index] = point;
                break;
            case IOPointType.DIGITAL_OUTPUT:
                this.digital_outputs[index] = point;
                break;
            case IOPointType.ANALOG_INPUT:
                this.analog_inputs[index] = point;
                break;
            case IOPointType.ANALOG_OUTPUT:
                this.analog_outputs[index] = point;
                break;
            default:
                break;
        }
    }

    public insertPointByChannel(point: IOPointConfiguration, channel: number) {
        try {
            let ioArray: Array<IOPointConfiguration | null> | null = null;
            let arrayType:
                | 'digital_inputs'
                | 'digital_outputs'
                | 'analog_inputs'
                | 'analog_outputs'
                | null = null;

            // let ioArrayAndType = this.getIOArrayByType(point.type);
            // ioArray = ioArrayAndType[0];
            // arrayType = ioArrayAndType[1];

            switch (point.type) {
                case IOPointType.DIGITAL_INPUT:
                    ioArray = this.digital_inputs;
                    arrayType = 'digital_inputs';
                    break;
                case IOPointType.DIGITAL_OUTPUT:
                    ioArray = this.digital_outputs;
                    arrayType = 'digital_outputs';
                    break;
                case IOPointType.ANALOG_INPUT:
                    ioArray = this.analog_inputs;
                    arrayType = 'analog_inputs';
                    break;
                case IOPointType.ANALOG_OUTPUT:
                    ioArray = this.analog_outputs;
                    arrayType = 'analog_outputs';
                    break;
                default:
                    break;
            }

            if (!ioArray) {
                console.log(`Target array of type ${point.type} not found`);
            }

            const insertionIndex = this.getPointIndexByChannel(
                ioArray,
                channel
            );

            if (insertionIndex === -1) {
                console.log(`Can't find channel for insertion`);
            }

            // console.info("Current io array state", ioArray);
            ioArray[insertionIndex] = point;
            this[arrayType] = ioArray;
        } catch (e) {
            console.log(
                `Point channel ${channel} with type ${IOPointType[point.type]} does not exist`
            );
        }
    }

    public resetPointByChannel(point: IOPointConfiguration, index: number) {
        try {
            let ioArray: Array<IOPointConfiguration | null> | null = null;
            let arrayType:
                | 'digital_inputs'
                | 'digital_outputs'
                | 'analog_inputs'
                | 'analog_outputs'
                | null = null;
            const channel = point.channel;

            switch (point.type) {
                case IOPointType.DIGITAL_INPUT:
                    ioArray = this.digital_inputs;
                    arrayType = 'digital_inputs';
                    break;
                case IOPointType.DIGITAL_OUTPUT:
                    ioArray = this.digital_outputs;
                    arrayType = 'digital_outputs';
                    break;
                case IOPointType.ANALOG_INPUT:
                    ioArray = this.analog_inputs;
                    arrayType = 'analog_inputs';
                    break;
                case IOPointType.ANALOG_OUTPUT:
                    ioArray = this.analog_outputs;
                    arrayType = 'analog_outputs';
                    break;
                default:
                    break;
            }

            const removeIndex = this.getPointIndexByChannel(ioArray, channel);

            if (removeIndex === -1) {
                console.log(`Can't find channel for insertion`);
            }

            // remove the point
            ioArray.splice(removeIndex, 1);

            // Reset the IO point at the given index
            const resetPoint = new IOPointConfiguration({
                id: uuidv4(),
                channel: null,
                type: point.type,
                enabled: false,
                configured: false,
                label: '',
                measurement_unit: '',
                min_value: 0,
                min_signal_v: 0,
                max_value: 0,
                max_signal_v: 0,
                value: null,
            });

            ioArray.push(resetPoint);

            this[arrayType] = [...ioArray];
        } catch (e) {
            console.error(
                `Error resetting point channel ${point.channel} with type ${IOPointType[point.type]}:`,
                e
            );
        }
    }

    public deletePointByIndex(point_type: IOPointType, index: number) {
        try {
            switch (point_type) {
                case IOPointType.DIGITAL_INPUT:
                    this.digital_inputs.splice(index, 1);
                    break;
                case IOPointType.DIGITAL_OUTPUT:
                    this.digital_outputs.splice(index, 1);
                    break;
                case IOPointType.ANALOG_INPUT:
                    this.analog_inputs.splice(index, 1);
                    break;
                case IOPointType.ANALOG_OUTPUT:
                    this.analog_outputs.splice(index, 1);
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log(
                `Point index ${index} with type ${IOPointType[point_type]} does not exist`
            );
        }
    }

    public reorderPointByIndex(
        point_type: IOPointType,
        source_channel: number,
        destination_channel: number
    ): void {
        const point_array = this.getIOPoints(point_type);

        if (!point_array || point_array.length === 0) {
            console.warn(`No points found for type ${IOPointType[point_type]}`);
            return;
        }

        // Getting index of channles to move
        const source_index = this.getPointIndexByChannel(
            point_array,
            source_channel
        );
        const destination_index = this.getPointIndexByChannel(
            point_array,
            destination_channel
        );

        const newPointArray = [...point_array];

        const [moved_point] = newPointArray.splice(source_index, 1);

        if (!moved_point) {
            console.warn(`Invalid source index ${source_index}`);
            return;
        }

        newPointArray.splice(destination_index, 0, moved_point);

        switch (point_type) {
            case IOPointType.DIGITAL_INPUT:
                this.digital_inputs = newPointArray;
                break;
            case IOPointType.DIGITAL_OUTPUT:
                this.digital_outputs = newPointArray;
                break;
            case IOPointType.ANALOG_INPUT:
                this.analog_inputs = newPointArray;
                break;
            case IOPointType.ANALOG_OUTPUT:
                this.analog_outputs = newPointArray;
                break;
            default:
                console.warn('Unknown point type');
        }
    }

    public isPointAvailable(point_type: IOPointType) {
        const point_array = this.getIOPoints(point_type);
        return (
            point_array.map((p) => p.channel).length >=
            this.configuration_constants[point_type]
        );
    }

    public getNextAvailablePointIndex(point_type: IOPointType): number {
        const point_array = this.getIOPoints(point_type);
        if (point_array.length > 0) {
            const used_channels = point_array
                .filter((p) => p.configured)
                .map((p) => p.channel);
            const possible_channels = [
                ...Array(this.configuration_constants[point_type]).keys(),
            ]
                .filter((c) => !used_channels.includes(c))
                .sort();
            if (possible_channels.length > 0) {
                return possible_channels[0];
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }
}

export interface HardwareConfigurationInterface {
    io_system: IOConfigurationInterface;
    axes: Array<AxisConfigurationInterface>;
}

export class HardwareConfiguration implements HardwareConfigurationInterface {
    io_system: IOConfiguration;
    axes: Array<AxisConfiguration> = [];

    constructor(input: HardwareConfigurationInterface) {
        this.io_system = new IOConfiguration(input.io_system);
        this.axes = [0, 1, 2, 3].map(
            (axis_index) =>
                new AxisConfiguration({
                    index: axis_index,
                    label: `axis ${axis_index}`,
                })
        );
    }
}

// BEGIN NEW

export enum CameraServiceType {
    START_STREAM,
    STOP_STREAM,
    DETECT_CAMERAS,
    ENABLE_AI,
    CAPTURE_FRAME,
}

export enum AITrainingServiceType {
    GET_STATUS,
    START_TRAINING,
    STOP_TRAINING,
    DEPLOY_MODEL,
    GET_PROJECTS,
}

export const basicApiResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export const createApiResponseSchema = <T>(schema?: z.ZodSchema<T>) => {
    const baseSchema = z.object({
        authenticated: z.boolean(),
        // backend_response: z.object({
        //     success: z.boolean(),
        //     message: z.string(),
        //     // The 'data' field's schema is now dynamic.
        //     data: schema.nullable(),
        // }),
        // backend_response: basicApiResponseSchema.extend({
        //     data: schema.nullable(),
        // }),
        proxy_error: z.boolean(),
        proxy_error_string: z.string(),
    });

    if (schema)
        return baseSchema.extend({
            backend_response: basicApiResponseSchema.extend({
                data: schema.nullable(),
            }),
        });
    else
        return baseSchema.extend({
            backend_response: basicApiResponseSchema.extend({
                data: z.any().optional(),
            }),
        });
};

export const availableTablesSchema = z.array(
    z.object({ table_name: z.string(), columns: z.array(z.string()) })
);
export type availableTables = z.infer<typeof availableTablesSchema>;
