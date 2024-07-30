// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client"

import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import ROSLIB from "roslib"; // Add this import statement

import Modal from "@/lib/components/client_components/Modal";
import { AnalogInputContext } from "./AnalogInputContext";
// import DashboardContext from "@/lib/models/dashboard_context";
import { ApplicationContext } from "@/lib/models/dashboard_context";
import { IOPointConfiguration } from "@/lib/models/api_models";
// import { useRos } from "@/lib/ros/RosContext";
import timeoutServiceCall from "@/lib/utils/timeoutServiceCall"; // Import the timeoutServiceCall function
import "@/lib/components/client_components/AnalogInput.css"; // Assuming you have a CSS file for styles

type AnalogInputProps = {
  index: number,
  input: IOPointConfiguration,
  updateInput: any,
  deleteInput: any,
  setIsConfigOpen: Dispatch<SetStateAction<any>>,
  dashboardContext: ApplicationContext
}

const AnalogInput = ({
  index,
  input,
  updateInput,
  deleteInput,
  setIsConfigOpen,
  dashboardContext
}: AnalogInputProps) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state
  const { inputs } = useContext(AnalogInputContext);
  // const { configService } = useRos();
  // const {context} = useContext

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
      type: updatedInput.type === "Voltage" ? 0 : 1,
      transfer_function: updatedInput.transferFunction,
      measurement_unit: updatedInput.measurementUnit,
      min_electrical_value: updatedInput.minElectricalValue,
      min_measurement_value: updatedInput.minMeasurementValue,
      max_electrical_value: updatedInput.maxElectricalValue,
      max_measurement_value: updatedInput.maxMeasurementValue,
      custom_transfer_function: "empty transfer function string",
    });

    // Set loading state to true
    setIsLoading(true);

    // Call the config service with timeout
    timeoutServiceCall(dashboardContext.config_service, request, 3000)
    // timeoutServiceCall(configService, request, 3000)
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
        setErrorMessage("Service call failed: " + error.message);
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

  const interpolateColor = (value) => {
    const startColor = [200, 200, 200]; // RGB for gray
    const endColor = [59, 136, 195]; // RGB for #3B88C3
    const ratio = value / 10;

    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* <div className="drag-handle" {...(!showConfig && provided.dragHandleProps)}>⋮⋮⋮</div> */}
      <div
        className="input-circle"
        style={{
          backgroundColor: interpolateColor(input.value),
        }}
      >
        {input.channel}
      </div>
      <button
        className="config-button"
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
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        {errorMessage && (
          <div className="error-overlay">
            <div className="error-dialog">
              <p>{errorMessage}</p>
              <button onClick={() => setErrorMessage("")}>Close</button>
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

      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={input.enabled}
          onChange={handleToggleChange}
        />
        <span className="slider"></span>
      </label>

      <span className="input-label">{input.label}</span>
      <div className="vertical-divider"></div>
      <span className="input-type">{input.type}</span>
    </div>
  );
};

const AnalogInputConfigDialog = ({ input, onSave, onDelete }) => {
  const [localInput, setLocalInput] = useState(input);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalInput({ ...localInput, [name]: value });
  };

  const handleChannelChange = (e) => {
    const { value } = e.target;
    setLocalInput({ ...localInput, channel: parseInt(value) });
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    setLocalInput({ ...localInput, type: value });
  };

  const unitLabel = localInput.type === "Current" ? "(mA)" : "(V)";

  return (
    <div className="dialog">
      <div className="dialog-row">
        <label>Label</label>
        <input
          type="text"
          name="label"
          value={localInput.label}
          onChange={handleChange}
        />
      </div>
      <div className="dialog-row">
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
      <div className="dialog-row">
        <label>Type</label>
        <select name="type" value={localInput.type} onChange={handleTypeChange}>
          <option value="Voltage">Voltage</option>
          <option value="Current">Current</option>
        </select>
      </div>
      <div className="dialog-row">
        <label>Transfer Function</label>
        <select
          name="transferFunction"
          value={localInput.transfer}
          onChange={handleChange}
        >
          <option value="linear">Linear</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="dialog-row">
        <label>Measurement Unit</label>
        <input
          type="text"
          name="measurementUnit"
          value={localInput.measurementUnit}
          onChange={handleChange}
        />
      </div>
      <div className="dialog-row">
        <label>Min Electrical Value {unitLabel}</label>
        <input
          type="text"
          name="minElectricalValue"
          value={localInput.minValue}
          onChange={handleChange}
        />
      </div>
      <div className="dialog-row">
        <label>Min Measurement Value ({localInput.measurementUnit})</label>
        <input
          type="text"
          name="minMeasurementValue"
          value={localInput.minSignal}
          onChange={handleChange}
        />
      </div>
      <div className="dialog-row">
        <label>Max Electrical Value {unitLabel}</label>
        <input
          type="text"
          name="maxElectricalValue"
          value={localInput.maxValue}
          onChange={handleChange}
        />
      </div>
      <div className="dialog-row">
        <label>Max Measurement Value ({localInput.measurementUnit})</label>
        <input
          type="text"
          name="maxMeasurementValue"
          value={localInput.maxSignal}
          onChange={handleChange}
        />
      </div>
      <div className="dialog-buttons">
        <button onClick={onDelete}>Delete</button>
        <button onClick={() => onSave(localInput)}>Save</button>
      </div>
    </div>
  );
};

export default AnalogInput;
