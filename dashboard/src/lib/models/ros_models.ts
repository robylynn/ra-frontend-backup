interface AnalogInHardwareConfig {
    configured: boolean
    enabled: boolean
    channel_type: number
}

export interface AnalogInConfig {
    // is_enable_disable_request: boolean
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

export interface AnalogInConfigurationServiceInterface {
    is_enable_disable_request: boolean
    config: AnalogInConfig
}

export interface DigitalInHardwareConfig {
    configured: boolean
    enabled: boolean
}

export interface DigitalInConfig {
    // is_enable_disable_request: boolean
    channel: number
    hardware_config: DigitalInHardwareConfig
    label: string
}

export interface DigitalInConfigurationServiceInterface {
    is_enable_disable_request: boolean
    config: DigitalInConfig
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

export interface DigitalInData {
    stamp: ROSTimestamp
    read_channels: Array<boolean>
    values: Array<boolean>
}