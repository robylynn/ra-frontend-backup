// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client"

import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import ROSLIB from "roslib"; // Add this import statement

import Modal from "@/lib/components/client_components/Modal";
import { AnalogInputContext } from "@/lib/components/client_components/AnalogInputContext";
import DashboardContext from "@/lib/models/dashboard_context";
// import DashboardContext from "@/lib/models/dashboard_context";
// import { ApplicationContext } from "@/lib/models/dashboard_context";
import { IOPointConfiguration, IOPointType, TransferFunctionType } from "@/lib/models/api_models";
// import { useRos } from "@/lib/ros/RosContext";
import timeoutServiceCall from "@/lib/utils/timeoutServiceCall"; // Import the timeoutServiceCall function
// import "@/lib/components/client_components/AnalogInput.css"; // Assuming you have a CSS file for styles
import { R2Button, R2SliderToggle } from "@/lib/components/client_components/ClickButton";


type AnalogInputProps = {
  index: number,
  input: IOPointConfiguration,
  updateInput: any,
  deleteInput: any,
  setIsConfigOpen: Dispatch<SetStateAction<any>>,
  // dashboardContext: ApplicationContext
}

const AnalogInput = ({
  index,
  input,
  updateInput,
  deleteInput,
  setIsConfigOpen,
  // dashboardContext
}: AnalogInputProps) => {
  const { dashboardContext } = useContext(DashboardContext);
  const { inputs } = useContext(AnalogInputContext);

  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state  

  const handleConfigSave = (updatedInput: IOPointConfiguration) => {
    console.log("Updated input:", updatedInput);

    // Validate the channel
    const isChannelUsed = inputs.some(
      (inp) =>
        inp.channel === updatedInput.channel &&
        inp.id !== input.id &&
        inp.enabled
    );
    if (isChannelUsed) {
      alert("This channel is already used by another enabled input.");
      return;
    }

    // Check if the config service is available
    // if (!configService) {
    if (!dashboardContext.config_service) {
      console.error("Service not defined");
      return;
    }

    // Define the request
    const request = new ROSLIB.ServiceRequest({
      label: updatedInput.label,
      channel: updatedInput.channel,
      type: updatedInput.type === IOPointType.ANALOG_VOLTAGE_INPUT ? 0 : 1,
      transfer_function: updatedInput.transfer_function_type,
      measurement_unit: updatedInput.measurement_unit,
      min_electrical_value: updatedInput.min_signal_v,
      min_measurement_value: updatedInput.min_value,
      max_electrical_value: updatedInput.max_signal_v,
      max_measurement_value: updatedInput.max_value,
      custom_transfer_function: "empty transfer function string",
    });

    // Set loading state to true
    setIsLoading(true);

    // Call the config service with timeout
    timeoutServiceCall(dashboardContext.config_service, request, 3000)
      .then((result) => {
        if ((result as any).success) {
          console.log("Service call successful:", result);
          updateInput(updatedInput);
          setShowConfig(false); // Hide the config dialog only on success
          setIsConfigOpen(false); // Notify parent component that config is closed
        } else {
          console.error("Failed to update configuration");
          setErrorMessage("Failed to update configuration");
        }
      })
      .catch((error) => {
        console.error("Service call failed:", error);
        setErrorMessage("Service call failed: " + error.toString());
      })
      .finally(() => {
        setIsLoading(false); // Set loading state to false
      });
  };

  // const handleCheckboxChange = (e) => {
  //   const { checked } = e.target;

  //   // Validate enabling the input
  //   if (checked) {
  //     const isChannelUsed = inputs.some(
  //       (inp) => inp.channel === input.channel && inp.id !== input.id && inp.enabled
  //     );
  //     if (isChannelUsed) {
  //       alert('Cannot enable this input. Another input with the same channel is already enabled.');
  //       return;
  //     }
  //   }

  //   updateInput({ ...input, enabled: checked });
  // };

  const handleToggleChange = (e) => {
    // CHANGE updated handler function
    const { checked } = e.target;

    // Validate enabling the input
    if (checked) {
      const isChannelUsed = inputs.some(
        (inp) =>
          inp.channel === input.channel && inp.id !== input.id && inp.enabled
      );
      if (isChannelUsed) {
        alert(
          "Cannot enable this input. Another input with the same channel is already enabled."
        );
        return;
      }
    }

    updateInput({ ...input, enabled: checked });
  };

  const interpolateColor = (value: number) => {
    const startColor = [200, 200, 200]; // RGB for gray
    const endColor = [59, 136, 195]; // RGB for #3B88C3
    const ratio = value / 10;

    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0])).toString(16);
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1])).toString(16);
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2])).toString(16);

    // return `rgb(${r}, ${g}, ${b})`;
    return `#${r}${g}${b}`;
  };

  return (
    <div className="flex items-center">
      {/* <div className="drag-handle" {...(!showConfig && provided.dragHandleProps)}>⋮⋮⋮</div> */}
      <div
        className={`flex bg-gray-300 rounded-full w-[40px] h-[20px] justify-center items-center m-[8px] bg-[${interpolateColor(input.value)}]`}
        style={{
          backgroundColor: interpolateColor(input.value),
        }}
      >
        {input.channel}
      </div>
      <button
        className="m-8px"
        onClick={() => {
          setShowConfig(true);
          setIsConfigOpen(true);
        }}
      >
        ⚙️
      </button>

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
          <div className="flex fixed inset-0 bg-red/[0.5] z-[10000] items-center justify-center">
            <div className="bg-white p-[20px] rounded-[5px] shadow-[0px,2px,10px] shadow-black/0.1">
              <p>{errorMessage}</p>
              <R2Button
                text={"Close"}
                onClick={() => setErrorMessage("")}
              />
            </div>
          </div>
        )}
        <AnalogInputConfigDialog
          input={input}
          onSave={handleConfigSave}
          onDelete={() => {
            deleteInput();
            setShowConfig(false);
            setIsConfigOpen(false);
          }}
        />
      </Modal>

      {/* <input
        className="input-checkbox"
        type="checkbox"
        checked={input.enabled}
        onChange={handleToggleChange}
      /> */}
      <R2SliderToggle
        text={""}
        state={input.enabled}
        onClick={handleToggleChange}
      />
      
      <label className="relative inline-block h-[24px]">
      {/* <label className="toggle-switch"> */}
        <input
          className="opacity-0 w-0 h-0"
          type="checkbox"
          checked={input.enabled}
          onChange={handleToggleChange}
        />
        {/* <span className="slider"></span> */}
        <span className="absolute cursor-pointer top-0"></span>
      </label>

      <span className="m-[8px]">{input.label}</span>
      {/* <div className="vertical-divider"></div> */}
      <div className="h-[20px] border-l-[1px] border-[#ccc] mx-[16px] my-[16px]"></div>
      <span className="m-[8px]">{IOPointType[input.type]}</span>
    </div>
  );
};

interface AnalogInputConfigDialogInterface { 
  input: IOPointConfiguration;
  onSave: (updatedInput: IOPointConfiguration) => void;
  onDelete: () => void;
}


const AnalogInputConfigDialog = ({ input, onSave, onDelete }: AnalogInputConfigDialogInterface) => {
  const [localInput, setLocalInput] = useState(input);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalInput({ ...localInput, [name]: value });
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    let numeric_value = parseFloat(value);
    if (numeric_value) {
      setLocalInput({ ...localInput, [name]: numeric_value });
    } else {
      setLocalInput({ ...localInput, [name]: "" });
    }
    
  };

  const handleTransferFunctionChange = (e) => {
    const value = TransferFunctionType[e.target.value as keyof typeof TransferFunctionType];
    setLocalInput({ ...localInput, transfer_function_type: value });
  };

  const handleChannelChange = (e) => {
    const { value } = e.target;
    setLocalInput({ ...localInput, channel: parseInt(value) });
  };

  const handleTypeChange = (e) => {
    const value = IOPointType[e.target.value as keyof typeof IOPointType];
    // const value2 = e.target.value as keyof typeof IOPointType;
    setLocalInput({ ...localInput, type: value });
  };

  const unitLabel = localInput.type === IOPointType.ANALOG_CURRENT_INPUT ? "(mA)" : "(V)";

  return (
    // <div className="dialog">
    <div className="flex flex-col w-full">
      {/* <div className="dialog-row"> */}
      <div className="flex flex-col mb-[10px]">
        <label>Label</label>
        <input
          type="text"
          name="label"
          value={localInput.label}
          onChange={handleChange}
        />
      </div>
      {/* <div className="dialog-row"> */}
      <div className="flex flex-col mb-[10px]">
        <label>Channel</label>
        <select
          name="channel"
          value={localInput.channel}
          onChange={handleChannelChange}
        >
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Type</label>
        <select name="type" value={IOPointType[localInput.type]} onChange={handleTypeChange}>
          <option value={IOPointType[IOPointType.ANALOG_VOLTAGE_INPUT]}>Voltage</option>
          <option value={IOPointType[IOPointType.ANALOG_CURRENT_INPUT]}>Current</option>
        </select>
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Transfer Function</label>
        <select
          name="transferFunction"
          value={TransferFunctionType[localInput.transfer_function_type]}
          onChange={handleTransferFunctionChange}
        >
          <option value={TransferFunctionType[TransferFunctionType.LINEAR]}>Linear</option>
          <option value={TransferFunctionType[TransferFunctionType.CUSTOM]}>Custom</option>
        </select>
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Measurement Unit</label>
        <input
          type="text"
          name="measurement_unit"
          value={localInput.measurement_unit}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Min Electrical Value {unitLabel}</label>
        <input
          type="text"
          name="min_signal_v"
          value={localInput.min_signal_v}
          onChange={handleNumericChange}
        />
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Min Measurement Value ({localInput.min_value})</label>
        <input
          type="text"
          name="min_value"
          value={localInput.min_value}
          onChange={handleNumericChange}
        />
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Max Electrical Value {unitLabel}</label>
        <input
          type="text"
          name="max_signal_v"
          value={localInput.max_signal_v}
          onChange={handleNumericChange}
        />
      </div>
      <div className="flex flex-col mb-[10px]">
        <label>Max Measurement Value ({localInput.measurement_unit})</label>
        <input
          type="text"
          name="max_value"
          value={localInput.max_value}
          onChange={handleNumericChange}
        />
      </div>
      <div className="flex justify-between mt-[20px]">
        <R2Button
          className="w-[60px]"
          text={"Delete"}
          onClick={onDelete}
        />
        <R2Button
          className="w-[60px]"
          text={"Save"}
          onClick={() => onSave(localInput)}
        />
      </div>
    </div>
  );
};

export default AnalogInput;
