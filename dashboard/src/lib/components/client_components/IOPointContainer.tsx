// DigitalInput.js
import React, {
  useState,
  useContext,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import Modal from "@/lib/components/client_components/Modal";
// import { DigitalInputContext } from "@/lib/components/client_components/DigitalInputContext";
import DashboardContext from "@/lib/models/dashboard_context";
import {
  AnalogIOPointType,
  IOPointConfiguration,
  IOPointType,
  TransferFunctionType,
} from "@/lib/models/api_models";
// import { useRos } from '../ros/RosContext';
import {
  R2Button,
  R2SliderToggle,
} from "@/lib/components/client_components/ClickButton";
import ROSLIB from "roslib";
import timeoutServiceCall from "@/lib/utils/timeoutServiceCall";
import { IOPointContext } from "./IOPointContext";
import { AnalogInConfig, DigitalInConfig } from "@/lib/models/ros_models";
// import "./AnalogInput.css"; // TODO: Rename this css to be more general

type IOPointContainerProps = {
  index: number;
  io_point: IOPointConfiguration;
  updatePoint: (point: IOPointConfiguration) => void;
  deletePoint: () => void;
  setIsConfigOpen: Dispatch<SetStateAction<any>>;
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
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state

  const handleConfigSave = (updatedIOPoint: IOPointConfiguration) => {
    console.log("Updated input:", updatedIOPoint);

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

    // Check if the config service is available
    if (!dashboardContext.IO_config_services?.get_service(io_point.type)) {
      console.error(
        `Service for point type ${IOPointType[io_point.type]} not defined`
      );
      return;
    }

    let request_data: { config: AnalogInConfig | DigitalInConfig };
    switch (io_point.type) {
      case IOPointType.ANALOG_INPUT: {
        request_data = {
          config: {
            channel: updatedIOPoint.channel,
            hardware_config: {
              configure: true,
              enable: false,
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
          config: {
            channel: updatedIOPoint.channel,
            hardware_config: {
              configure: true,
              enable: false,
            },
            label: updatedIOPoint.label,
          },
        };
        break;
      }
    }

    // Define the request
    const request = new ROSLIB.ServiceRequest(request_data);

    // Set loading state to true
    setIsLoading(true);

    // Call the config service with timeout
    timeoutServiceCall(
      dashboardContext.IO_config_services.get_service(io_point.type),
      request,
      3000
    )
      .then((result) => {
        if ((result as any).success) {
          console.log("Service call successful:", result);
          updatedIOPoint.configured = true;
          updatePoint(updatedIOPoint);
          setShowConfig(false); // Hide the config dialog only on success
          setIsConfigOpen(false); // Notify parent component that config is closed
        } else {
          console.error("Failed to update configuration");
          setErrorMessage(
            `Failed to update configuration: ${(result as any).message}`
          );
        }
      })
      .catch((error) => {
        console.error("Configuration update failed: ", error);
        setErrorMessage("Configuration update failed: " + error);
      })
      .finally(() => {
        setIsLoading(false); // Set loading state to false
      });
  };

  const handleDelete = (deletableIOPoint: IOPointConfiguration) => {
    // Check if the config service is available
    if (!dashboardContext.IO_config_services?.get_service(io_point.type)) {
      console.error(
        `Service for point type ${IOPointType[io_point.type]} not defined`
      );
      return;
    }

    if (deletableIOPoint.configured) {
      let request_data: { config: AnalogInConfig | DigitalInConfig };
      switch (io_point.type) {
        case IOPointType.ANALOG_INPUT: {
          request_data = {
            config: {
              channel: deletableIOPoint.channel,
              hardware_config: {
                configure: false,
                enable: false,
                channel_type: 0,
              },
              label: "",
              unit: "",
              max_electrical_value: 0,
              min_electrical_value: 0,
              max_measurement_value: 0,
              min_measurement_value: 0,
              transfer_function_type: 0,
            },
          };
        }
        case IOPointType.DIGITAL_INPUT: {
          request_data = {
            config: {
              channel: deletableIOPoint.channel,
              hardware_config: {
                configure: false,
                enable: false,
              },
              label: "",
            },
          };
        }
      }

      // Define the request
      const request = new ROSLIB.ServiceRequest(request_data);

      // Set loading state to true
      setIsLoading(true);

      // Call the config service with timeout
      timeoutServiceCall(
        dashboardContext.IO_config_services.get_service(io_point.type),
        request,
        3000
      )
        .then((result) => {
          if ((result as any).success) {
            console.log("Service call successful:", result);
            deletePoint();
            setShowConfig(false); // Hide the config dialog only on success
            setIsConfigOpen(false); // Notify parent component that config is closed
          } else {
            console.error("Failed to update configuration");
            setErrorMessage(
              `Failed to update configuration: ${(result as any).message}`
            );
          }
        })
        .catch((error) => {
          console.error("Configuration update failed: ", error);
          setErrorMessage("Configuration update failed: " + error);
        })
        .finally(() => {
          setIsLoading(false); // Set loading state to false
        });
    } else {
      deletePoint();
    }
  };

  const handleToggleChange = (e) => {
    // const handleToggleChange = (e: React.ChangeEvent) => {
    const { checked } = e.target;

    // Validate enabling the input
    if (checked) {
      const isChannelUsed = IOPoints[io_point.type].some(
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

    io_point.enabled = checked;
    updatePoint(io_point);
  };

  return (
    <div className="flex items-center justify-between h-[40px]">
      <div className="grid grid-cols-3 w-[40%] items-center">
      <div
        className="bg-slate-200 rounded-[50%] w-[20px] h-[20px] flex justify-center items-center"
        style={{
          backgroundColor: io_point.value
            ? "rgb(59, 136, 195)"
            : "rgb(200, 200, 200)", // TODO: Global vars for these colors
        }}
      >
        {io_point.channel}
      </div>
      <button
        className="m-[8px]"
        onClick={() => {
          setShowConfig(true);
          setIsConfigOpen(true);
        }}
      >
        ⚙️
      </button>

      <R2SliderToggle
        text={""}
        state={io_point.enabled}
        // onChange={() => {}}
        onClick={handleToggleChange}
      />
      </div>

      <span className="m-[8px]">{io_point.label}</span>

      <Modal
        isOpen={showConfig}
        onClose={() => {
          setShowConfig(false);
          setIsConfigOpen(false);
        }}
      >
        {isLoading && (
          <div className="flex fixed inset-0 bg-black/[0.5] z-[9999] justify-center items-center">
            <div className="border-[8px] border-black/[0.3] border-t-[8px] border-t-white rounded-[50%] w-[60px] h-[60px] animate-spin"></div>
          </div>
        )}
        {errorMessage && (
          <div className="flex fixed inset-0 bg-red-600/[0.5] z-[10000] items-center justify-center">
            <div className="bg-white p-[20px] rounded-[5px] border shadow-[0px,2px,10px] shadow-black/0.1 max-w-[50%]">
              <p>{errorMessage}</p>
              <R2Button text={"Close"} onClick={() => setErrorMessage("")} />
            </div>
          </div>
        )}
        <IOPointConfigDialog
          io_point={io_point}
          onSave={handleConfigSave}
          onDelete={() => {
            handleDelete(io_point);
            setShowConfig(false);
            setIsConfigOpen(false);
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
  const [localPoint, setLocalPoint] = useState<IOPointConfiguration>(io_point);
  const { dashboardContext } = useContext(DashboardContext);

  const handleStringChange = (e) => {
    const { name, value } = e.target;
    // localPoint[name] = value;
    setLocalPoint((p) => ({ ...p, [name]: value }));
    console.log("setting string to " + value);
  };

  const handleChannelChange = (e) => {
    const { value } = e.target;
    setLocalPoint((p) => ({ ...p, channel: parseInt(value) }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    let numeric_value = parseFloat(value);
    if (numeric_value) {
      setLocalPoint((p) => ({ ...p, [name]: numeric_value }));
    } else {
      setLocalPoint((p) => ({ ...p, [name]: "" }));
    }
  };

  const handleAnalogTypeChange = (e) => {
    const value =
      AnalogIOPointType[e.target.value as keyof typeof AnalogIOPointType];
    setLocalPoint((p) => ({ ...p, analog_type: value }));
  };

  const handleTransferFunctionChange = (e) => {
    const value =
      TransferFunctionType[e.target.value as keyof typeof TransferFunctionType];
    // localPoint.transfer_function_type = value;
    // setLocalPoint(localPoint);

    setLocalPoint((p) => ({ ...p, transfer_function_type: value }));
  };

  const unitLabel =
    localPoint.analog_type === AnalogIOPointType.CURRENT ? "(mA)" : "(V)";

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col mb-[10px]">
        <label>Label</label>
        <input
          type="text"
          name="label"
          value={localPoint.label}
          onChange={handleStringChange}
          className="w-full p-[5px] box-border"
        />
      </div>
      <div className="flex flex-col mb-[10px]">
        <label className="mb-[5px]">Channel</label>
        <select
          name="channel"
          value={localPoint.channel}
          onChange={handleChannelChange}
          className="w-full p-[5px] box-border"
        >
          {
            [
              ...Array(
                // dashboardContext.hardware_configuration?.io_system
                //   .configuration_constants[io_point.type]
                dashboardContext.hardware_configuration?.io_system.getMaximumChannels(
                  io_point.type
                )
                // .get_maximum_channels(io_point.type)
              ).keys(),
            ].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))
          }
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
              <option value={AnalogIOPointType[AnalogIOPointType.VOLTAGE]}>
                Voltage
              </option>
              <option value={AnalogIOPointType[AnalogIOPointType.CURRENT]}>
                Current
              </option>
            </select>
          </div>

          <div className="flex flex-col mb-[10px]">
            <label>Transfer Function</label>
            <select
              name="transferFunction"
              value={TransferFunctionType[localPoint.transfer_function_type]}
              onChange={handleTransferFunctionChange}
            >
              <option value={TransferFunctionType[TransferFunctionType.LINEAR]}>
                Linear
              </option>
              <option value={TransferFunctionType[TransferFunctionType.CUSTOM]}>
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
              {localPoint.measurement_unit != ""
                ? ` (${localPoint.measurement_unit})`
                : ""}
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
              {localPoint.measurement_unit != ""
                ? ` (${localPoint.measurement_unit})`
                : ""}
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
