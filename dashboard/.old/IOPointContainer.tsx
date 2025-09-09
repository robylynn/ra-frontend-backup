import {
    R2Button,
    R2SliderToggle,
} from '@/lib/components/client_components/ClickButton';
import { DashboardContext } from '@/lib/components/client_components/DashboardContextWrapper';
import {
    AnalogValueDisplayElement,
    DigitalValueDisplayElement,
} from '@/lib/components/client_components/IODisplay';
import { IOPointContext } from '@/lib/components/client_components/IOPointContext';
import Modal from '@/lib/components/client_components/Modal';
import {
    AnalogIOPointType,
    IOPointConfiguration,
    IOPointType,
} from '@/lib/models/api_models';
import {
    IRosTypeR2CInterfacesAnalogInConfigConst,
    IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType,
} from '@/lib/models/ros_types';
import {
    Dispatch,
    ReactElement,
    SetStateAction,
    useContext,
    useState,
} from 'react';

type IOPointContainerProps = {
    index: number;
    io_point: IOPointConfiguration;
    updatePoint: (point: IOPointConfiguration) => void;
    deletePoint: () => void;
    setIsConfigOpen: Dispatch<SetStateAction<any>>;
    setErrorMessage: (message: string) => void;
};

const IOPointContainer = ({
    index,
    io_point,
    updatePoint,
    deletePoint,
    setIsConfigOpen,
    setErrorMessage,
}: IOPointContainerProps) => {
    const { dashboardContext } = useContext(DashboardContext);
    const { IOPoints } = useContext(IOPointContext);
    const [showConfig, setShowConfig] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [analogOutputCommandString, setAnalogOutputCommandString] =
        useState<string>('');

    const handleConfigSave = (updatedIOPoint: IOPointConfiguration) => {
        // Validate the channel
        const isChannelUsed = IOPoints.getIOPoints(updatedIOPoint.type).some(
            (p) =>
                p.channel === updatedIOPoint.channel &&
                p.id !== io_point.id &&
                p.enabled
        );

        if (isChannelUsed) {
            alert('This channel is already used by another enabled input.');
            return;
        }

        // Set loading state to true
        setIsLoading(true);

        const updatedIOPointChannel = updatedIOPoint.channel;
        const oldIOPointChannel = io_point.channel;

        if (updatedIOPointChannel !== oldIOPointChannel) {
            const oldIOPoint = io_point.copy();
            oldIOPoint.configured = false;
            dashboardContext.io_configuration_services
                .configure_io_point(
                    oldIOPoint,
                    () => {
                        deletePoint();
                        setShowConfig(false);
                        setIsConfigOpen(false);
                    },
                    undefined,
                    undefined,
                    () => console.log('Deleted old point')
                )
                .catch((error) => {
                    setShowConfig(false);
                    setErrorMessage(
                        error && error.message
                            ? error.message.toString()
                            : 'Unknown error occurred'
                    );
                });
        }

        dashboardContext.io_configuration_services
            .configure_io_point(
                updatedIOPoint,
                () => {
                    updatedIOPoint.configured = true;
                    updatePoint(updatedIOPoint);
                    setShowConfig(false);
                    setIsConfigOpen(false);
                },
                undefined,
                undefined,
                () => setIsLoading(false)
            )
            .catch((error) => {
                setShowConfig(false);
                setErrorMessage(
                    error ? error.toString() : 'Unknown error occurred'
                );
            });
    };

    const handleDelete = (deletableIOPoint: IOPointConfiguration) => {
        if (!deletableIOPoint) {
            console.log('Not a deletable input');
            setErrorMessage('Not a deletable input.');
            return;
        }

        const updatedIOPoint = deletableIOPoint.copy();

        // Set loading state to true
        setIsLoading(true);

        updatedIOPoint.enabled = false;
        dashboardContext.io_configuration_services
            .enable_io_point(
                updatedIOPoint,
                () => {},
                undefined,
                undefined,
                undefined
            )
            .catch((error) => {
                console.log('Error in enable toggle: ', error);
                setErrorMessage(
                    error ? error.toString() : 'Unknown error occurred.'
                );
            });

        updatedIOPoint.configured = false;
        dashboardContext.io_configuration_services
            .configure_io_point(
                updatedIOPoint,
                () => {
                    deletePoint();
                    setShowConfig(false);
                    setIsConfigOpen(false);
                },
                undefined,
                undefined,
                () => {
                    setIsLoading(false);
                }
            )
            .catch((error) => {
                setIsConfigOpen(false);
                setErrorMessage(
                    error ? error.message.toString() : 'Unknown error occurred'
                );
            });
    };

    const handleEnableToggleClick = (e) => {
        const { checked } = e.target;

        // Validate enabling the input
        if (checked) {
            // TODO: after channel reordering, enable and disable get lost. Check the getIOPoints from toggle
            const isChannelUsed = IOPoints.getIOPoints(io_point.type).some(
                (p) =>
                    p.channel === io_point.channel &&
                    p.id !== io_point.id &&
                    p.enabled
            );

            if (isChannelUsed) {
                alert(
                    'Cannot enable this input. Another input with the same channel is already enabled.'
                );
                return;
            }
        }

        let updatedIOPoint = io_point.copy();
        updatedIOPoint.enabled = checked;

        dashboardContext.io_configuration_services
            .enable_io_point(
                updatedIOPoint,
                () => {},
                undefined,
                undefined,
                undefined
            )
            .catch((error) => {
                console.log('Error in enable toggle: ', error);
                setErrorMessage(
                    error ? error.toString() : 'Unknown error occurred.'
                );
            });
    };

    const handleDigitalStateToggleClick = (e) => {
        const { checked } = e.target;

        dashboardContext.io_command_services.set_digital_output_point(
            io_point.channel,
            checked,
            () =>
                console.log(
                    `Set ${IOPointType[io_point.type]} point ${io_point.channel} to ${checked}`
                ),
            () =>
                console.log(
                    `Failed to set ${IOPointType[io_point.type]} point ${io_point.channel} to ${checked}`
                ),
            (error: string) =>
                console.log(
                    `Error settingg ${IOPointType[io_point.type]} point ${io_point.channel} to ${checked}: ${error}`
                )
        );
    };

    const renderIOElement = (io_point: IOPointConfiguration): ReactElement => {
        switch (io_point.type) {
            case IOPointType.ANALOG_INPUT: {
                const value =
                    dashboardContext.analog_in_data?.values[io_point.channel];
                return (
                    <div className="w-full grid grid-cols-[50%_50%]">
                        <div></div>
                        <AnalogValueDisplayElement
                            value={value}
                            enabled={io_point.enabled}
                            configured={io_point.mcu_configuration_valid}
                        />
                    </div>
                );
            }
            case IOPointType.DIGITAL_INPUT: {
                return (
                    <div className="w-full grid grid-cols-[50%_50%]">
                        <div></div>
                        <DigitalValueDisplayElement
                            value={
                                dashboardContext.digital_in_data?.values[
                                    io_point.channel
                                ]
                            }
                            enabled={io_point.enabled}
                            configured={io_point.mcu_configuration_valid}
                        />
                    </div>
                );
            }
            case IOPointType.DIGITAL_OUTPUT: {
                const value =
                    dashboardContext.digital_out_data?.values[io_point.channel];
                return (
                    <div className="w-full grid grid-cols-[50%_50%]">
                        <R2SliderToggle
                            on_text={'ON'}
                            off_text="OFF"
                            state={value}
                            enabled={io_point.enabled}
                            onClick={handleDigitalStateToggleClick}
                        />
                        <DigitalValueDisplayElement
                            value={value}
                            enabled={io_point.enabled}
                            configured={io_point.mcu_configuration_valid}
                        />
                    </div>
                );
            }
            case IOPointType.ANALOG_OUTPUT: {
                const value =
                    dashboardContext.analog_out_data?.values[io_point.channel];
                return (
                    <div className="w-full h-[40px] grid grid-cols-[50%_50%]">
                        <div className="flex flex-row px-2 justify-between">
                            {io_point.enabled ? (
                                <>
                                    <input
                                        type="text"
                                        name="output_value"
                                        value={analogOutputCommandString}
                                        onChange={(e) =>
                                            setAnalogOutputCommandString(
                                                e.target.value
                                            )
                                        }
                                        className="w-[50%] p-[5px] box-border"
                                    />
                                    <R2Button
                                        text="Set"
                                        onClick={() => {
                                            const command_value = parseFloat(
                                                analogOutputCommandString
                                            );
                                            dashboardContext.io_command_services.set_analog_output_point(
                                                io_point.channel,
                                                command_value
                                            );
                                            setAnalogOutputCommandString(
                                                command_value.toString()
                                            );
                                        }}
                                        className="px-1"
                                    />
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                        <AnalogValueDisplayElement
                            value={value}
                            enabled={io_point.enabled}
                            configured={io_point.mcu_configuration_valid}
                        />
                    </div>
                );
            }
        }
    };

    return (
        <div className="flex items-center justify-between h-[40px]">
            <div className="grid grid-cols-[15%_30%_15%_33%_7%] place-items-center w-full items-center justify-center">
                <div
                    className="w-[60%] h-[40%] flex justify-center content-center items-center rounded-[4px] border-2 border-slate-300 text-black"
                    style={{
                        backgroundColor: io_point.mcu_configuration_valid
                            ? 'rgb(20, 200, 20, 1)' // TODO: Global vars for these colors
                            : 'rgb(200, 200, 200, 1)',
                    }}
                >
                    {io_point.channel}
                </div>

                <div className="bg-white w-[80%] h-[40%] flex justify-center items-center rounded-[4px] border-2 border-slate-300">
                    <span className="m-[8px] text-black">{io_point.label}</span>
                </div>

                <R2SliderToggle
                    state={io_point.enabled}
                    enabled={io_point.mcu_configuration_valid}
                    onClick={handleEnableToggleClick}
                />

                {renderIOElement(io_point)}

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
