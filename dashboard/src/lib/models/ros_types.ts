/* eslint-disable */
// These files were generated using "ros-typescript-generator"
export interface IRosTypeR2CInterfacesAnalogInConfig {
  channel: number;
  hardware_config: IRosTypeR2CInterfacesAnalogInHardwareConfig;
  label: string;
  unit: string;
  min_electrical_value: number;
  min_measurement_value: number;
  max_electrical_value: number;
  max_measurement_value: number;
  transfer_function_type: number;
}

export enum IRosTypeR2CInterfacesAnalogInConfigConst {
  TRANSFER_FUNCTION_LINEAR = 0,
  TRANSFER_FUNCTION_CUSTOM = 1,
}

export interface IRosTypeR2CInterfacesAnalogInData {
  stamp: { sec: number, nanosec: number };
  read_channels: boolean[];
  values: number[];
  types: number[];
}

export enum IRosTypeR2CInterfacesAnalogInDataConst {
  MAX_NUM_CHANNELS = 3,
  CHANNEL_0 = 0,
  CHANNEL_1 = 1,
  CHANNEL_2 = 2,
  MIN_VOLTAGE = 0,
  MAX_VOLTAGE = 10,
  MIN_CURRENT = 4,
  MAX_CURRENT = 20,
}

export interface IRosTypeR2CInterfacesAnalogInHardwareConfig {
  configured: boolean;
  enabled: boolean;
  channel_type: IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType;
}

export enum IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType {
  CHANNEL_TYPE_VOLTAGE = 0,
  CHANNEL_TYPE_CURRENT = 1,
}

export interface IRosTypeR2CInterfacesAnalogOutConfig {
  channel: number;
  hardware_config: IRosTypeR2CInterfacesAnalogOutHardwareConfig;
  label: string;
  unit: string;
  min_electrical_value: number;
  min_measurement_value: number;
  max_electrical_value: number;
  max_measurement_value: number;
  transfer_function_type: number;
}

export enum IRosTypeR2CInterfacesAnalogOutConfigConst {
  TRANSFER_FUNCTION_LINEAR = 0,
  TRANSFER_FUNCTION_CUSTOM = 1,
}

export interface IRosTypeR2CInterfacesAnalogOutData {
  stamp: { sec: number, nanosec: number };
  write_channels: boolean[];
  values: number[];
}

export enum IRosTypeR2CInterfacesAnalogOutDataConst {
  MAX_NUM_CHANNELS = 4,
  CHANNEL_0 = 0,
  CHANNEL_1 = 1,
  CHANNEL_2 = 2,
  CHANNEL_3 = 3,
  MIN_VOLTAGE = 0,
  MAX_VOLTAGE = 10,
}

export interface IRosTypeR2CInterfacesAnalogOutHardwareConfig {
  configured: boolean;
  enabled: boolean;
  pwm_period_ms: IRosTypeR2CInterfacesAnalogOutHardwareConfigPwmPeriodMs;
  initial_value_volts: number;
  estop_configured: boolean;
  estop_value_volts: number;
}

export enum IRosTypeR2CInterfacesAnalogOutHardwareConfigPwmPeriodMs {
  PWM_PERIOD_MIN_MS = 1,
  PWM_PERIOD_MAX_MS = 255,
}

export interface IRosTypeR2CInterfacesAxesEstimates {
  stamp: { sec: number, nanosec: number };
  axis_0_encoder_estimates: IRosTypeR2CInterfacesEncoderEstimates;
  axis_0_torques: IRosTypeR2CInterfacesTorques;
  axis_1_encoder_estimates: IRosTypeR2CInterfacesEncoderEstimates;
  axis_1_torques: IRosTypeR2CInterfacesTorques;
  axis_2_encoder_estimates: IRosTypeR2CInterfacesEncoderEstimates;
  axis_2_torques: IRosTypeR2CInterfacesTorques;
  axis_3_encoder_estimates: IRosTypeR2CInterfacesEncoderEstimates;
  axis_3_torques: IRosTypeR2CInterfacesTorques;
}

export interface IRosTypeR2CInterfacesAxisError {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  error: IRosTypeR2CInterfacesAxisErrorError;
}

export enum IRosTypeR2CInterfacesAxisErrorError {
  ERROR_NONE = 0,
  ERROR_INITIALIZING = 1,
  ERROR_SYSTEM_LEVEL = 2,
  ERROR_TIMING_ERROR = 4,
  ERROR_MISSING_ESTIMATE = 8,
  ERROR_BAD_CONFIG = 16,
  ERROR_DRV_FAULT = 32,
  ERROR_MISSING_INPUT = 64,
  ERROR_DC_BUS_OVER_VOLTAGE = 256,
  ERROR_DC_BUS_UNDER_VOLTAGE = 512,
  ERROR_DC_BUS_OVER_CURRENT = 1024,
  ERROR_DC_BUS_OVER_REGEN_CURRENT = 2048,
  ERROR_CURRENT_LIMIT_VIOLATION = 4096,
  ERROR_MOTOR_OVER_TEMP = 8192,
  ERROR_INVERTER_OVER_TEMP = 16384,
  ERROR_VELOCITY_LIMIT_VIOLATION = 32768,
  ERROR_POSITION_LIMIT_VIOLATION = 65536,
  ERROR_WATCHDOG_TIMER_EXPIRED = 16777216,
  ERROR_ESTOP_REQUESTED = 33554432,
  ERROR_SPINOUT_DETECTED = 67108864,
  ERROR_OTHER_DEVICE_FAILED = 134217728,
  ERROR_THERMISTOR_DISCONNECTED = 268435456,
  ERROR_CALIBRATION_ERROR = 1073741824,
}

export interface IRosTypeR2CInterfacesAxisState {
  stamp: { sec: number, nanosec: number };
  axis_index: IRosTypeR2CInterfacesAxisStateAxisIndex;
  state: number;
}

export enum IRosTypeR2CInterfacesAxisStateAxisIndex {
  STATE_UNDEFINED = 0,
  STATE_IDLE = 1,
  STATE_STARTUP_SEQUENCE = 2,
  STATE_FULL_CALIBRATION_SEQUENCE = 3,
  STATE_MOTOR_CALIBRATION = 4,
  STATE_SENSORLESS_CONTROL = 5,
  STATE_ENCODER_INDEX_SEARCH = 6,
  STATE_ENCODER_OFFSET_CALIBRATION = 7,
  STATE_CLOSED_LOOP_CONTROL = 8,
  STATE_LOCKIN_SPIN = 9,
  STATE_ENCODER_DIR_FIND = 10,
  STATE_HOMING = 11,
  STATE_ENCODER_HALL_POLARITY_CALIBRATION = 12,
  STATE_ENCODER_HALL_PHASE_CALIBRATION = 13,
}

export interface IRosTypeR2CInterfacesBusVoltageCurrent {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  voltage: number;
  current: number;
}

export interface IRosTypeR2CInterfacesClearErrors {
  request: IRosTypeR2CInterfacesClearErrorsRequest;
  response: IRosTypeR2CInterfacesClearErrorsResponse;
}

export interface IRosTypeR2CInterfacesClearErrorsRequest {
  axis_index: number;
  timeout_ms: number;
}

export interface IRosTypeR2CInterfacesClearErrorsResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesConfigureAiTraining {
  request: IRosTypeR2CInterfacesConfigureAiTrainingRequest;
  response: IRosTypeR2CInterfacesConfigureAiTrainingResponse;
}

export interface IRosTypeR2CInterfacesConfigureAiTrainingRequest {
  project_id: number;
  model_type: string;
  epochs: number;
  batch_size: number;
}

export interface IRosTypeR2CInterfacesConfigureAiTrainingResponse {
  success: boolean;
  message: string;
  job_id: string;
}

export interface IRosTypeR2CInterfacesConfigureAnalogIn {
  request: IRosTypeR2CInterfacesConfigureAnalogInRequest;
  response: IRosTypeR2CInterfacesConfigureAnalogInResponse;
}

export interface IRosTypeR2CInterfacesConfigureAnalogInRequest {
  is_config_request: boolean;
  is_enable_disable_request: boolean;
  config: IRosTypeR2CInterfacesAnalogInConfig;
}

export interface IRosTypeR2CInterfacesConfigureAnalogInResponse {
  success: boolean;
  message: string;
}

export interface IRosTypeR2CInterfacesConfigureAnalogOut {
  request: IRosTypeR2CInterfacesConfigureAnalogOutRequest;
  response: IRosTypeR2CInterfacesConfigureAnalogOutResponse;
}

export interface IRosTypeR2CInterfacesConfigureAnalogOutRequest {
  is_config_request: boolean;
  is_enable_disable_request: boolean;
  config: IRosTypeR2CInterfacesAnalogOutConfig;
}

export interface IRosTypeR2CInterfacesConfigureAnalogOutResponse {
  success: boolean;
  message: string;
}

export interface IRosTypeR2CInterfacesConfigureCameraStream {
  request: IRosTypeR2CInterfacesConfigureCameraStreamRequest;
  response: IRosTypeR2CInterfacesConfigureCameraStreamResponse;
}

export interface IRosTypeR2CInterfacesConfigureCameraStreamRequest {
  camera_id: number;
  uvc_camera: boolean;
}

export interface IRosTypeR2CInterfacesConfigureCameraStreamResponse {
  success: boolean;
  message: string;
}

export interface IRosTypeR2CInterfacesConfigureDigitalIn {
  request: IRosTypeR2CInterfacesConfigureDigitalInRequest;
  response: IRosTypeR2CInterfacesConfigureDigitalInResponse;
}

export interface IRosTypeR2CInterfacesConfigureDigitalInRequest {
  is_config_request: boolean;
  is_enable_disable_request: boolean;
  config: IRosTypeR2CInterfacesDigitalInConfig;
}

export interface IRosTypeR2CInterfacesConfigureDigitalInResponse {
  success: boolean;
  message: string;
}

export interface IRosTypeR2CInterfacesConfigureDigitalOut {
  request: IRosTypeR2CInterfacesConfigureDigitalOutRequest;
  response: IRosTypeR2CInterfacesConfigureDigitalOutResponse;
}

export interface IRosTypeR2CInterfacesConfigureDigitalOutRequest {
  is_config_request: boolean;
  is_enable_disable_request: boolean;
  config: IRosTypeR2CInterfacesDigitalOutConfig;
}

export interface IRosTypeR2CInterfacesConfigureDigitalOutResponse {
  success: boolean;
  message: string;
}

export interface IRosTypeR2CInterfacesConfigureGpio {
  request: IRosTypeR2CInterfacesConfigureGpioRequest;
  response: IRosTypeR2CInterfacesConfigureGpioResponse;
}

export interface IRosTypeR2CInterfacesConfigureGpioRequest {
  di_is_config_request: boolean[];
  di_is_enable_disable_request: boolean[];
  di_channels_configs: IRosTypeR2CInterfacesDigitalInHardwareConfig[];
  do_is_config_request: boolean[];
  do_is_enable_disable_request: boolean[];
  do_channels_configs: IRosTypeR2CInterfacesDigitalOutHardwareConfig[];
  ai_is_config_request: boolean[];
  ai_is_enable_disable_request: boolean[];
  ai_channels_configs: IRosTypeR2CInterfacesAnalogInHardwareConfig[];
  ao_is_config_request: boolean[];
  ao_is_enable_disable_request: boolean[];
  ao_channels_configs: IRosTypeR2CInterfacesAnalogOutHardwareConfig[];
  timeout_ms: number;
}

export enum IRosTypeR2CInterfacesConfigureGpioRequestConst {
  DI_MAX_CHANNELS = 8,
  DO_MAX_CHANNELS = 8,
  AI_MAX_CHANNELS = 3,
  AO_MAX_CHANNELS = 4,
}

export interface IRosTypeR2CInterfacesConfigureGpioResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesConfigureMotion {
  request: IRosTypeR2CInterfacesConfigureMotionRequest;
  response: IRosTypeR2CInterfacesConfigureMotionResponse;
}

export interface IRosTypeR2CInterfacesConfigureMotionRequest {
  axes_to_enable: boolean[];
  axes_params: IRosTypeR2CInterfacesMotionControllerParams[];
  timeout_ms: number;
}

export enum IRosTypeR2CInterfacesConfigureMotionRequestConst {
  NUM_AXES = 4,
}

export interface IRosTypeR2CInterfacesConfigureMotionResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesControlMode {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  mode: IRosTypeR2CInterfacesControlModeMode;
}

export enum IRosTypeR2CInterfacesControlModeMode {
  MODE_VOLTAGE_CONTROL = 0,
  MODE_TORQUE_CONTROL = 1,
  MODE_VELOCITY_CONTROL = 2,
  MODE_POSITION_CONTROL = 3,
}

export interface IRosTypeR2CInterfacesControllerError {
  stamp: { sec: number, nanosec: number };
  axis_index: IRosTypeR2CInterfacesControllerErrorAxisIndex;
  error: number;
}

export enum IRosTypeR2CInterfacesControllerErrorAxisIndex {
  ERROR_NONE = 0,
  ERROR_OVERSPEED = 1,
  ERROR_INVALID_INPUT_MODE = 2,
  ERROR_UNSTABLE_GAIN = 4,
  ERROR_INVALID_MIRROR_AXIS = 8,
  ERROR_INVALID_LOAD_ENCODER = 16,
  ERROR_INVALID_ESTIMATE = 32,
  ERROR_INVALID_CIRCULAR_RANGE = 64,
  ERROR_SPINOUT_DETECTED = 128,
}

export interface IRosTypeR2CInterfacesCreateOpcuaSubscription {
  request: IRosTypeR2CInterfacesCreateOpcuaSubscriptionRequest;
  response: IRosTypeR2CInterfacesCreateOpcuaSubscriptionResponse;
}

export interface IRosTypeR2CInterfacesCreateOpcuaSubscriptionRequest {
  nodeid: string;
  data_type: IRosTypeR2CInterfacesOpcuaDataType;
}

export interface IRosTypeR2CInterfacesCreateOpcuaSubscriptionResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesDetectCamerasResponse {
  success: boolean;
  message: string;
  cameras_json: string;
}

export interface IRosTypeR2CInterfacesDetection {
  class_name: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IRosTypeR2CInterfacesDetectionArray {
  header: IRosTypeStdMsgsHeader;
  image_id: number;
  detections: IRosTypeR2CInterfacesDetection[];
}

export interface IRosTypeR2CInterfacesDigitalInConfig {
  channel: number;
  hardware_config: IRosTypeR2CInterfacesDigitalInHardwareConfig;
  label: string;
}

export interface IRosTypeR2CInterfacesDigitalInData {
  stamp: { sec: number, nanosec: number };
  read_channels: boolean[];
  values: boolean[];
}

export enum IRosTypeR2CInterfacesDigitalInDataConst {
  MAX_NUM_CHANNELS = 8,
  CHANNEL_0 = 0,
  CHANNEL_1 = 1,
  CHANNEL_2 = 2,
  CHANNEL_3 = 3,
  CHANNEL_4 = 4,
  CHANNEL_5 = 5,
  CHANNEL_6 = 6,
  CHANNEL_7 = 7,
  OUTPUT_LOW = 0,
  OUTPUT_HIGH = 1,
}

export interface IRosTypeR2CInterfacesDigitalInHardwareConfig {
  configured: boolean;
  enabled: boolean;
}

export interface IRosTypeR2CInterfacesDigitalOutConfig {
  channel: number;
  hardware_config: IRosTypeR2CInterfacesDigitalOutHardwareConfig;
  label: string;
}

export interface IRosTypeR2CInterfacesDigitalOutData {
  stamp: { sec: number, nanosec: number };
  write_channels: boolean[];
  values: boolean[];
}

export enum IRosTypeR2CInterfacesDigitalOutDataConst {
  MAX_NUM_CHANNELS = 8,
  CHANNEL_0 = 0,
  CHANNEL_1 = 1,
  CHANNEL_2 = 2,
  CHANNEL_3 = 3,
  CHANNEL_4 = 4,
  CHANNEL_5 = 5,
  CHANNEL_6 = 6,
  CHANNEL_7 = 7,
  OUTPUT_LOW = 0,
  OUTPUT_HIGH = 1,
}

export interface IRosTypeR2CInterfacesDigitalOutHardwareConfig {
  configured: boolean;
  enabled: boolean;
  initial_value: boolean;
  estop_configured: boolean;
  estop_value: boolean;
}

export interface IRosTypeR2CInterfacesEncoderEstimates {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  position: number;
  velocity: number;
}

export interface IRosTypeR2CInterfacesError {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  active_errors: IRosTypeR2CInterfacesAxisError;
  disarm_reason: IRosTypeR2CInterfacesAxisError;
}

export interface IRosTypeR2CInterfacesGetAiProjectsResponse {
  success: boolean;
  message: string;
  projects: IRosTypeR2CInterfacesProjectInfo[];
}

export interface IRosTypeR2CInterfacesGetAiStatusRequest {
  id: number;
  title: string;
  description: string;
  total_annotations: number;
  ground_truth_count: number;
}

export interface IRosTypeR2CInterfacesGetApplicationStringResponse {
  payload: string;
}

export interface IRosTypeR2CInterfacesGetAxisStatus {
  request: IRosTypeR2CInterfacesGetAxisStatusRequest;
  response: IRosTypeR2CInterfacesGetAxisStatusResponse;
}

export interface IRosTypeR2CInterfacesGetAxisStatusRequest {
  axis_index: number;
  timeout_ms: number;
}

export interface IRosTypeR2CInterfacesGetAxisStatusResponse {
  success: boolean;
  stamp: { sec: number, nanosec: number };
  version: IRosTypeR2CInterfacesVersion;
  heartbeat: IRosTypeR2CInterfacesHeartbeat;
  error: IRosTypeR2CInterfacesError;
  iq: IRosTypeR2CInterfacesIq;
  temperature: IRosTypeR2CInterfacesTemperature;
  bus_voltage_current: IRosTypeR2CInterfacesBusVoltageCurrent;
  controller_error: IRosTypeR2CInterfacesControllerError;
}

export interface IRosTypeR2CInterfacesGpioConfigurationState {
  stamp: { sec: number, nanosec: number };
  digital_input_configs: IRosTypeR2CInterfacesDigitalInHardwareConfig[];
  digital_output_configs: IRosTypeR2CInterfacesDigitalOutHardwareConfig[];
  analog_input_configs: IRosTypeR2CInterfacesAnalogInHardwareConfig[];
  analog_output_configs: IRosTypeR2CInterfacesAnalogOutHardwareConfig[];
}

export interface IRosTypeR2CInterfacesHeartbeat {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  axis_error: IRosTypeR2CInterfacesAxisError;
  axis_state: IRosTypeR2CInterfacesAxisState;
  procedure_result: number;
  trajectory_done_flag: boolean;
}

export enum IRosTypeR2CInterfacesHeartbeatConst {
  RESULT_SUCCESS = 0,
  RESULT_BUSY = 1,
  RESULT_CANCELLED = 2,
  RESULT_DISARMED = 3,
  RESULT_NO_RESPONSE = 4,
  RESULT_POLE_PAIR_CPR_MISMATCH = 5,
  RESULT_PHASE_RESISTANCE_OUT_OF_RANGE = 6,
  RESULT_PHASE_INDUCTANCE_OUT_OF_RANGE = 7,
  RESULT_UNBALANCED_PHASES = 8,
  RESULT_INVALID_MOTOR_TYPE = 9,
  RESULT_ILLEGAL_HALL_STATE = 10,
  RESULT_TIMEOUT = 11,
  RESULT_HOMING_WITHOUT_ENDSTOP = 12,
  RESULT_INVALID_STATE = 13,
  RESULT_NOT_CALIBRATED = 14,
  RESULT_NOT_CONVERGING = 15,
}

export interface IRosTypeR2CInterfacesInputMode {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  mode: IRosTypeR2CInterfacesInputModeMode;
}

export enum IRosTypeR2CInterfacesInputModeMode {
  MODE_INACTIVE = 0,
  MODE_PASSTHROUGH = 1,
  MODE_VEL_RAMP = 2,
  MODE_POS_FILTER = 3,
  MODE_MIX_CHANNELS = 4,
  MODE_TRAP_TRAJ = 5,
  MODE_TORQUE_RAMP = 6,
  MODE_MIRROR = 7,
  MODE_TUNING = 8,
}

export interface IRosTypeR2CInterfacesInputPos {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  pos_turns: IRosTypeR2CInterfacesInputPosPosTurns;
  vel_ff_turns_per_s: number;
  torque_ff_nm: number;
  input_mode: IRosTypeR2CInterfacesInputMode;
}

export enum IRosTypeR2CInterfacesInputPosPosTurns {
  FACTOR_VEL_FF = 0.001,
  FACTOR_TORQUE_FF = 0.001,
}

export interface IRosTypeR2CInterfacesInputTorque {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  torque_nm: number;
  input_mode: IRosTypeR2CInterfacesInputMode;
}

export interface IRosTypeR2CInterfacesInputVel {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  vel_turns_per_s: number;
  torque_ff_nm: number;
  input_mode: IRosTypeR2CInterfacesInputMode;
}

export interface IRosTypeR2CInterfacesIq {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  setpoint: number;
  measured: number;
}

export interface IRosTypeR2CInterfacesJogAxis {
  request: IRosTypeR2CInterfacesJogAxisRequest;
  response: IRosTypeR2CInterfacesJogAxisResponse;
}

export interface IRosTypeR2CInterfacesJogAxisRequest {
  axis_index: number;
  mode: number;
  amount: number;
}

export enum IRosTypeR2CInterfacesJogAxisRequestConst {
  JOG_STOP = 0,
  JOG_VELOCITY = 1,
  JOG_POSITION = 2,
}

export interface IRosTypeR2CInterfacesJogAxisResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesMotionCanRaw {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  num_bytes: number;
  data: number[];
}

export interface IRosTypeR2CInterfacesMotionControllerParams {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  velocity_limit: number;
  current_limit: number;
  traj_vel_limit: number;
  traj_accel_limit: number;
  traj_decel_limit: number;
  traj_inertia: number;
  pos_gain: number;
  vel_gain: number;
  vel_integrator_gain: number;
}

export interface IRosTypeR2CInterfacesOpcuaData {
  stamp: { sec: number, nanosec: number };
  nodeid: string;
  data_type: IRosTypeR2CInterfacesOpcuaDataType;
  string_value: string;
  int_value: number;
  float_value: number;
}

export interface IRosTypeR2CInterfacesOpcuaDataType {
  type: IRosTypeR2CInterfacesOpcuaDataTypeType;
}

export enum IRosTypeR2CInterfacesOpcuaDataTypeType {
  TYPE_INTEGER = 1,
  TYPE_FLOAT = 2,
  TYPE_STRING = 3,
}

export interface IRosTypeR2CInterfacesProjectInfo {
  project_id: number;
  project_name: string;
}

export interface IRosTypeR2CInterfacesRealtimeSysState {
  stamp: { sec: number, nanosec: number };
  state: IRosTypeR2CInterfacesRealtimeSysStateState;
}

export enum IRosTypeR2CInterfacesRealtimeSysStateState {
  STATE_UNINITIALIZED = 0,
  STATE_READY = 1,
  STATE_RUNNING = 2,
  STATE_ERROR = 3,
}

export interface IRosTypeR2CInterfacesSetAnalogOutputStates {
  request: IRosTypeR2CInterfacesSetAnalogOutputStatesRequest;
  response: IRosTypeR2CInterfacesSetAnalogOutputStatesResponse;
}

export interface IRosTypeR2CInterfacesSetAnalogOutputStatesRequest {
  states: IRosTypeR2CInterfacesAnalogOutData;
}

export interface IRosTypeR2CInterfacesSetAnalogOutputStatesResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesSetApplicationString {
  request: IRosTypeR2CInterfacesSetApplicationStringRequest;
  response: IRosTypeR2CInterfacesSetApplicationStringResponse;
}

export interface IRosTypeR2CInterfacesSetApplicationStringRequest {
  payload: string;
}

export interface IRosTypeR2CInterfacesSetApplicationStringResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesSetAxisControllerMode {
  request: IRosTypeR2CInterfacesSetAxisControllerModeRequest;
  response: IRosTypeR2CInterfacesSetAxisControllerModeResponse;
}

export interface IRosTypeR2CInterfacesSetAxisControllerModeRequest {
  axis_index: number;
  control_mode: IRosTypeR2CInterfacesControlMode;
  input_mode: IRosTypeR2CInterfacesInputMode;
  timeout_ms: number;
}

export interface IRosTypeR2CInterfacesSetAxisControllerModeResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesSetAxisControllerParams {
  request: IRosTypeR2CInterfacesSetAxisControllerParamsRequest;
  response: IRosTypeR2CInterfacesSetAxisControllerParamsResponse;
}

export interface IRosTypeR2CInterfacesSetAxisControllerParamsRequest {
  axis_index: number;
  params: IRosTypeR2CInterfacesMotionControllerParams;
  timeout_ms: number;
}

export interface IRosTypeR2CInterfacesSetAxisControllerParamsResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesSetAxisState {
  request: IRosTypeR2CInterfacesSetAxisStateRequest;
  response: IRosTypeR2CInterfacesSetAxisStateResponse;
}

export interface IRosTypeR2CInterfacesSetAxisStateRequest {
  axis_index: number;
  state: IRosTypeR2CInterfacesAxisState;
  timeout_ms: number;
}

export interface IRosTypeR2CInterfacesSetAxisStateResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesSetDigitalOutputStates {
  request: IRosTypeR2CInterfacesSetDigitalOutputStatesRequest;
  response: IRosTypeR2CInterfacesSetDigitalOutputStatesResponse;
}

export interface IRosTypeR2CInterfacesSetDigitalOutputStatesRequest {
  states: IRosTypeR2CInterfacesDigitalOutData;
}

export interface IRosTypeR2CInterfacesSetDigitalOutputStatesResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesSetOpcuaVariable {
  request: IRosTypeR2CInterfacesSetOpcuaVariableRequest;
  response: IRosTypeR2CInterfacesSetOpcuaVariableResponse;
}

export interface IRosTypeR2CInterfacesSetOpcuaVariableRequest {
  data: IRosTypeR2CInterfacesOpcuaData;
}

export interface IRosTypeR2CInterfacesSetOpcuaVariableResponse {
  success: boolean;
}

export interface IRosTypeR2CInterfacesTemperature {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  fet_temperature: number;
  motor_temperature: number;
}

export interface IRosTypeR2CInterfacesToggleAi {
  request: IRosTypeR2CInterfacesToggleAiRequest;
  response: IRosTypeR2CInterfacesToggleAiResponse;
}

export interface IRosTypeR2CInterfacesToggleAiRequest {
  enable: boolean;
  inferencing_type: string;
}

export interface IRosTypeR2CInterfacesToggleAiResponse {
  success: boolean;
  message: string;
}

export interface IRosTypeR2CInterfacesTorques {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  target: number;
  estimate: number;
}

export interface IRosTypeR2CInterfacesTrainingProgress {
  epoch: number;
  total_epochs: number;
  train_loss: number;
  val_loss: number;
  val_map: number;
  status: string;
}

export interface IRosTypeR2CInterfacesVersion {
  stamp: { sec: number, nanosec: number };
  axis_index: number;
  protocol_version: number;
  hw_version_major: number;
  hw_version_minor: number;
  hw_version_variant: number;
  fw_version_major: number;
  fw_version_minor: number;
  fw_version_revision: number;
  fw_version_unreleased: number;
}

export interface IRosTypeStdMsgsBool {
  data: boolean;
}

export interface IRosTypeStdMsgsByte {
  data: number;
}

export interface IRosTypeStdMsgsByteMultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsChar {
  data: number;
}

export interface IRosTypeStdMsgsColorRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface IRosTypeStdMsgsFloat32 {
  data: number;
}

export interface IRosTypeStdMsgsFloat32MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsFloat64 {
  data: number;
}

export interface IRosTypeStdMsgsFloat64MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsHeader {
  stamp: { sec: number, nanosec: number };
  frame_id: string;
}

export interface IRosTypeStdMsgsInt16 {
  data: number;
}

export interface IRosTypeStdMsgsInt16MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsInt32 {
  data: number;
}

export interface IRosTypeStdMsgsInt32MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsInt64 {
  data: number;
}

export interface IRosTypeStdMsgsInt64MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsInt8 {
  data: number;
}

export interface IRosTypeStdMsgsInt8MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsMultiArrayDimension {
  label: string;
  size: number;
  stride: number;
}

export interface IRosTypeStdMsgsMultiArrayLayout {
  dim: IRosTypeStdMsgsMultiArrayDimension[];
  data_offset: number;
}

export interface IRosTypeStdMsgsString {
  data: string;
}

export interface IRosTypeStdMsgsUInt16 {
  data: number;
}

export interface IRosTypeStdMsgsUInt16MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsUInt32 {
  data: number;
}

export interface IRosTypeStdMsgsUInt32MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsUInt64 {
  data: number;
}

export interface IRosTypeStdMsgsUInt64MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}

export interface IRosTypeStdMsgsUInt8 {
  data: number;
}

export interface IRosTypeStdMsgsUInt8MultiArray {
  layout: IRosTypeStdMsgsMultiArrayLayout;
  data: number[];
}