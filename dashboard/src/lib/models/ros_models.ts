interface AnalogInHardwareConfig {
    configure: boolean
    enable: boolean
    channel_type: number
}

export interface AnalogInConfig {
    channel: number
    hardware_config: AnalogInHardwareConfig
    label: string
    unit: string
    min_electrical_value: number
    min_measurement_value: number
    max_electrical_value: number
    max_measurement_value: number
    transfer_function_type: number
}

export interface DigitalInHardwareConfig {
    configure: boolean
    enable: boolean
}

export interface DigitalInConfig {
    channel: number
    hardware_config: DigitalInHardwareConfig
    label: string
}

export interface ROSTimestamp {
    sec: number
    nanosec: number
}

export interface AnalogInData {
    stamp: ROSTimestamp
    read_channels: Array<boolean>
    values: Array<number>
    types: string
}

export interface AxisData {
    stamp: ROSTimestamp
    axis_index: number
    position: number
    velocity: number
}