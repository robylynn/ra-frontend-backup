import {
    R2Button,
    R2SliderToggle,
} from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import Modal from '@/lib/components/client_components/Modal';
import {
    AnalogIOPointType,
    IOPointConfiguration,
    IOPointType,
} from '@/lib/models/api_models';
import {
    IRosTypeR2CInterfacesAnalogInConfigConst,
    IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType,
    IRosTypeR2CInterfacesConfigureAnalogInRequest,
    IRosTypeR2CInterfacesConfigureDigitalInRequest,
} from '@/lib/models/ros_types';
import timeoutServiceCall from '@/lib/utils/timeoutServiceCall';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import ROSLIB from 'roslib';
import {
    AnalogValueDisplayElement,
    DigitalValueDisplayElement,
} from './IODisplay';
import { IOPointContext } from './IOPointContext';
import { Updock } from 'next/font/google';
import ApplicationContext from '@/lib/models/dashboard_context';

type IOPointContainerProps = {
    index: number;
    io_point: IOPointConfiguration;
    updatePoint: (point: IOPointConfiguration) => void;
    deletePoint: () => void;
    setIsConfigOpen: Dispatch<SetStateAction<any>>;
};

export const callConfigService = (
    dashboardContext: ApplicationContext,
    updatedIOPoint: IOPointConfiguration,
    onSuccess = () => {},
    onComplete = () => {},
    is_config_request: boolean = false,
    is_enable_disable_request: boolean = false
) => {
    return new Promise<void>((resolve, reject) => {
        // Check if the config service is available
        if (!dashboardContext.IO_config_services?.get_service(updatedIOPoint.type)) {
            const errorMsg = `Service for point type ${IOPointType[updatedIOPoint.type]} not defined`;
            console.error(errorMsg);
            reject(errorMsg);
            return;
        }

        let request_data:
            | IRosTypeR2CInterfacesConfigureAnalogInRequest
            | IRosTypeR2CInterfacesConfigureDigitalInRequest;

        switch (updatedIOPoint.type) {
            case IOPointType.ANALOG_INPUT: {
                request_data = {
                    is_enable_disable_request: is_enable_disable_request,
                    is_config_request: is_config_request,
                    config: {
                        channel: updatedIOPoint.channel,
                        hardware_config: {
                            configured: updatedIOPoint.configured,
                            enabled: updatedIOPoint.enabled,
                            channel_type: updatedIOPoint.analog_type,
                        },
                        label: updatedIOPoint.label,
                        unit: updatedIOPoint.measurement_unit,
                        max_electrical_value: updatedIOPoint.max_signal_v,
                        min_electrical_value: updatedIOPoint.min_signal_v,
                        max_measurement_value: updatedIOPoint.max_value,
                        min_measurement_value: updatedIOPoint.min_value,
                        transfer_function_type: updatedIOPoint.transfer_function_type,
                    },
                };
                break;
            }
            case IOPointType.DIGITAL_INPUT: {
                request_data = {
                    is_enable_disable_request: is_enable_disable_request,
                    is_config_request: is_config_request,
                    config: {
                        channel: updatedIOPoint.channel,
                        hardware_config: {
                            configured: updatedIOPoint.configured,
                            enabled: updatedIOPoint.enabled,
                        },
                        label: updatedIOPoint.label,
                    },
                };
                break;
            }
        }

        const request = new ROSLIB.ServiceRequest(request_data);

        timeoutServiceCall(
            dashboardContext.IO_config_services.get_service(updatedIOPoint.type),
            request,
            3000
        )
            .then((result) => {
                // console.log("Service call successful:", result);
                if ((result as any).success) {
                    if (onSuccess) onSuccess();
                    resolve();
                } else {
                    const errorMsg = "Failed to update configuration";
                    console.error(errorMsg);
                    reject(errorMsg);
                }
            })
            .catch((error) => {
                console.error("Configuration update failed: ", error);
                reject(error);
            })
            .finally(() => {
                if (onComplete) onComplete();
            });
    });
};


const IOPointContainer = ({
    index,
    io_point,
    updatePoint,
    deletePoint,
    setIsConfigOpen,
}: IOPointContainerProps) => {
    const { dashboardContext } = useContext(DashboardContext);
    const { IOPoints } = useContext(IOPointContext);
    const [showConfig, setShowConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [errorMessage, setErrorMessage] = useState(''); // Add error message state

    // Store digital value in state for immediate UI update
    const [digitalValue, setDigitalValue] = useState(false);
    const [isDigitalEnabled, setIsDigitalEnabled] = useState(false);

    // Update digitalValue when dashboardContext updates (real-time sync)
    useEffect(() => {

        if (dashboardContext.digital_in_data?.values) {
            const newValue =
                dashboardContext.digital_in_data.values[io_point.channel];
            setDigitalValue(newValue);
        }

        const enabledState =
            IOPoints.digital_inputs?.find(
                (input) => input.channel === io_point.channel
            )?.enabled ?? false;
        setIsDigitalEnabled(enabledState);
    }, [dashboardContext.digital_in_data, IOPoints, io_point.channel]);



    const handleConfigSave = (updatedIOPoint: IOPointConfiguration) => {
        // Validate the channel
        const isChannelUsed = IOPoints.getIOPoints(updatedIOPoint.type).some(
        (p) =>
            p.channel === updatedIOPoint.channel &&
            p.id !== io_point.id &&
            p.enabled
        );

        if (isChannelUsed) {
            alert("This channel is already used by another enabled input.");
            return;
        }

        // Set loading state to true
        setIsLoading(true);

        const updatedIOPointChannel = updatedIOPoint.channel;
        const oldIOPointChannel = io_point.channel;

        if (updatedIOPointChannel !== oldIOPointChannel) {
            const oldIOPoint = io_point.copy();
            oldIOPoint.configured = false;
            callConfigService(
                dashboardContext,
                oldIOPoint,
                () => {
                    deletePoint();
                    setShowConfig(false);
                    setIsConfigOpen(false);
                },
                () => console.log("Deleted old point"),
                false,
                true,
            ).catch((error) => {
                setErrorMessage(
                    error && error.message
                      ? error.message.toString()
                      : "Unknown error occurred"
                  );
            });
        } 

        callConfigService(
            dashboardContext,
            updatedIOPoint,
            () => {
                updatedIOPoint.configured = true;
                updatePoint(updatedIOPoint);
                setShowConfig(false);
                setIsConfigOpen(false);
            },
            () => setIsLoading(false),
            true,
            false
        ).catch((error) => {
            setErrorMessage(
                error && error.message
                  ? error.message.toString()
                  : "Unknown error occurred"
              );
        });
    };

    const handleDelete = (deletableIOPoint: IOPointConfiguration) => {
        if (!deletableIOPoint) {
            console.log("Not a deletable input");
            setErrorMessage("Not a deletable input.");
            return;
        }

        const updatedIOPoint = deletableIOPoint.copy();
        updatedIOPoint.configured = false;

        // Set loading state to true
        setIsLoading(true);
        
        callConfigService(
            dashboardContext,
            updatedIOPoint,
            () => {
                deletePoint();
                setShowConfig(false);
                setIsConfigOpen(false);
            },
            () => {
                setIsLoading(false)
            }
        ).catch((error) => {
            setErrorMessage(
                error && error.message
                    ? error.message.toString()
                    : "Unknown error occurred"
                );
        });
    };

    const handleToggleChange = (e) => {
        const { checked } = e.target;

        // Validate enabling the input
        if (checked) {
        // TODO: after channel reordering, enable and disable get lost. Check the getIOPoints from toggle
        const isChannelUsed = IOPoints.getIOPoints(io_point.type).some(
            (p) =>
            p.channel === io_point.channel && p.id !== io_point.id && p.enabled
        );

        if (isChannelUsed) {
            alert(
            "Cannot enable this input. Another input with the same channel is already enabled."
            );
            return;
        }
        }

        let updatedIOPoint = io_point.copy();
        updatedIOPoint.enabled = checked;
        callConfigService(
            dashboardContext,
            updatedIOPoint,
            () => {1
                // deletePoint();
                updatePoint(updatedIOPoint);
            },
            undefined,
            false,
            true
            ).catch((error) => { 
                console.log("Error in enable toggle: ", error.message);   
                setErrorMessage(
                    error && error.message
                      ? error.message.toString()
                      : "Unknown error occurred"
                  );
            });
        };

    return (
        <div className="flex items-center justify-between h-[40px]">
            {/* <div className="grid grid-cols-4 w-full items-center"> */}
            <div className="grid grid-cols-[15%_35%_25%_18%_7%] w-full items-center">
                <div
                    className="bg-slate-200 w-[60%] h-[40%] flex justify-center items-center rounded-[4px] border-2 border-slate-300 text-black"
                    style={{
                        backgroundColor: io_point.value
                            ? 'rgb(59, 136, 195)'
                            : 'rgb(200, 200, 200)', // TODO: Global vars for these colors
                    }}
                >
                    {io_point.channel}
                </div>

                <div className="bg-white w-[80%] h-[40%] flex justify-center items-center rounded-[4px] border-2 border-slate-300">
                    <span className="m-[8px] text-black">{io_point.label}</span>
                </div>

                <R2SliderToggle
                    text={''}
                    state={io_point.enabled}
                    // onChange={() => {}}
                    onClick={handleToggleChange}
                />

                {io_point.type === IOPointType.ANALOG_INPUT ? (
                    <AnalogValueDisplayElement
                        value={io_point.value}
                        enabled={io_point.enabled}
                    />
                ) : (
                    <DigitalValueDisplayElement
                        value={digitalValue}
                        enabled={isDigitalEnabled}
                    />
                )}

                <button
                    className="m-[8px] mr-4"
                    onClick={() => {
                        setShowConfig(true);
                        setIsConfigOpen(true);
                    }}
                >
                    ⚙️
                </button>
            </div>
            <div className="flex items-center justify-between h-[40px] relative">
                {isLoading && (
                        <div className="flex fixed inset-0 bg-black/[0.5] z-[9999] justify-center items-center">
                            <div className="border-[8px] border-black/[0.3] border-t-[8px] border-t-white rounded-[50%] w-[60px] h-[60px] animate-spin"></div>
                        </div>
                    )}
            </div>

            {errorMessage && (
                <div className="flex fixed inset-0 bg-red-600/[0.5] z-[10000] items-center justify-center">
                    <div className="bg-white p-[20px] rounded-[5px] border shadow-[0px,2px,10px] shadow-black/0.1 max-w-[50%]">
                        <p>Error: {errorMessage}.</p>
                        <R2Button
                            text={'Close'}
                            onClick={() => setErrorMessage('')}
                        />
                    </div>
                </div>
            )}

            <Modal
                isOpen={showConfig}
                onClose={() => {
                    setShowConfig(false);
                    setIsConfigOpen(false);
                }}
            >
                <IOPointConfigDialog
                    io_point={io_point}
                    onSave={handleConfigSave}
                    onDelete={() => {
                        handleDelete(io_point);
                    }}
                />
            </Modal>
        </div>
    );
};

interface IOPointConfigDialogInterface {
    io_point: IOPointConfiguration;
    onSave: (updatedInput: IOPointConfiguration) => void;
    onDelete: () => void;
}

const IOPointConfigDialog = ({
    io_point,
    onSave,
    onDelete,
}: IOPointConfigDialogInterface) => {
    const [localPoint, setLocalPoint] =
        useState<IOPointConfiguration>(io_point);
    const { dashboardContext } = useContext(DashboardContext);

    const handleStringChange = (e) => {
        const { name, value } = e.target;
        let newLocalPoint = localPoint.copy();
        newLocalPoint[name] = value;
        setLocalPoint(() => newLocalPoint);
    };

    const handleChannelChange = (e) => {
        const { value } = e.target;
        let newLocalPoint = localPoint.copy();
        newLocalPoint.channel = parseInt(value);
        setLocalPoint(() => newLocalPoint);
    };

    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        let numeric_value = parseFloat(value);
        let newLocalPoint = localPoint.copy();

        if (numeric_value) {
            newLocalPoint[name] = numeric_value;
        } else {
            newLocalPoint[name] = 0;
        }
        setLocalPoint(() => newLocalPoint);
    };

    const handleAnalogTypeChange = (e) => {
        const value =
            AnalogIOPointType[
                e.target
                    .value as keyof typeof IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType
            ];
        let newLocalPoint = localPoint.copy();
        newLocalPoint.analog_type = value;
        setLocalPoint(() => newLocalPoint);
    };

    const handleTransferFunctionChange = (e) => {
        const value =
            IRosTypeR2CInterfacesAnalogInConfigConst[
                e.target
                    .value as keyof typeof IRosTypeR2CInterfacesAnalogInConfigConst
            ];
        let newLocalPoint = localPoint.copy();
        newLocalPoint.transfer_function_type = value;
        setLocalPoint(() => newLocalPoint);
    };

    const unitLabel =
        localPoint.analog_type ===
        IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType.CHANNEL_TYPE_CURRENT
            ? '(mA)'
            : '(V)';

    return (
        <div className="flex flex-col w-full bg bg-color-gray-900 text-black rounded-lg shadow-lg border border-r2-green-300 p-[20px]">
            <div className="flex flex-col mb-[10px]">
                <label>Label</label>
                <div className="color-gray-200">
                    <input
                        type="text"
                        name="label"
                        value={localPoint.label}
                        onChange={handleStringChange}
                        className="w-full p-[5px] box-border"
                    />
                </div>
            </div>
            <div className="flex flex-col mb-[10px]">
                <label className="mb-[5px]">Channel</label>
                <select
                    name="channel"
                    value={localPoint.channel}
                    onChange={handleChannelChange}
                    className="w-full p-[5px] box-border"
                >
                    {[
                        ...Array(
                            dashboardContext.hardware_configuration?.io_system.getMaximumChannels(
                                io_point.type
                            )
                        ).keys(),
                    ].map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </select>
            </div>
            {localPoint.type == IOPointType.ANALOG_INPUT ||
            localPoint.type == IOPointType.ANALOG_OUTPUT ? (
                <div>
                    <div className="flex flex-col mb-[10px]">
                        <label>Type</label>
                        <select
                            name="analog_type"
                            value={AnalogIOPointType[localPoint.analog_type]}
                            onChange={handleAnalogTypeChange}
                        >
                            <option
                                value={
                                    AnalogIOPointType[AnalogIOPointType.VOLTAGE]
                                }
                            >
                                Voltage
                            </option>
                            <option
                                value={
                                    AnalogIOPointType[AnalogIOPointType.CURRENT]
                                }
                            >
                                Current
                            </option>
                        </select>
                    </div>

                    <div className="flex flex-col mb-[10px]">
                        <label>Transfer Function</label>
                        <select
                            name="transferFunction"
                            value={
                                IRosTypeR2CInterfacesAnalogInConfigConst[
                                    localPoint.transfer_function_type
                                ]
                            }
                            onChange={handleTransferFunctionChange}
                        >
                            <option
                                value={
                                    IRosTypeR2CInterfacesAnalogInConfigConst[
                                        IRosTypeR2CInterfacesAnalogInConfigConst
                                            .TRANSFER_FUNCTION_LINEAR
                                    ]
                                }
                            >
                                Linear
                            </option>
                            <option
                                value={
                                    IRosTypeR2CInterfacesAnalogInConfigConst[
                                        IRosTypeR2CInterfacesAnalogInConfigConst
                                            .TRANSFER_FUNCTION_CUSTOM
                                    ]
                                }
                            >
                                Custom
                            </option>
                        </select>
                    </div>
                    <div className="flex flex-col mb-[10px]">
                        <label>Measurement Unit</label>
                        <input
                            type="text"
                            name="measurement_unit"
                            value={localPoint.measurement_unit}
                            onChange={handleStringChange}
                        />
                    </div>
                    <div className="flex flex-col mb-[10px]">
                        <label>Min Electrical Value {unitLabel}</label>
                        <input
                            type="text"
                            name="min_signal_v"
                            value={localPoint.min_signal_v}
                            onChange={handleNumericChange}
                        />
                    </div>
                    <div className="flex flex-col mb-[10px]">
                        <label>
                            Min Measurement Value
                            {localPoint.measurement_unit != ''
                                ? ` (${localPoint.measurement_unit})`
                                : ''}
                        </label>
                        <input
                            type="text"
                            name="min_value"
                            value={localPoint.min_value}
                            onChange={handleNumericChange}
                        />
                    </div>
                    <div className="flex flex-col mb-[10px]">
                        <label>Max Electrical Value {unitLabel}</label>
                        <input
                            type="text"
                            name="max_signal_v"
                            value={localPoint.max_signal_v}
                            onChange={handleNumericChange}
                        />
                    </div>
                    <div className="flex flex-col mb-[10px]">
                        <label>
                            Max Measurement Value
                            {localPoint.measurement_unit != ''
                                ? ` (${localPoint.measurement_unit})`
                                : ''}
                        </label>
                        <input
                            type="text"
                            name="max_value"
                            value={localPoint.max_value}
                            onChange={handleNumericChange}
                        />
                    </div>
                </div>
            ) : (
                <></>
            )}
            <div className="flex justify-between mt-[20px]">
                <button onClick={onDelete}>Delete</button>
                <button onClick={() => onSave(localPoint)}>Save</button>
            </div>
        </div>
    );
};

export default IOPointContainer;
