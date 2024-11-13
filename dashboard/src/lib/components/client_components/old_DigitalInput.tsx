// DigitalInput.js
import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import Modal from "@/lib/components/client_components/Modal";
import { DigitalInputContext } from "@/lib/components/client_components/DigitalInputContext";
import DashboardContext from "@/lib/models/dashboard_context";
import { IOPointConfiguration, IOPointType } from "@/lib/models/api_models";
// import { useRos } from '../ros/RosContext';
import { R2Button, R2SliderToggle } from "@/lib/components/client_components/ClickButton";
import ROSLIB from "roslib";
import timeoutServiceCall from "@/lib/utils/timeoutServiceCall";
// import "./AnalogInput.css"; // TODO: Rename this css to be more general

type DigitalInputProps = {
  index: number,
  input: IOPointConfiguration,
  updateInput: any,
  deleteInput: any,
  setIsConfigOpen: Dispatch<SetStateAction<any>>,
}

const DigitalInput = ({
  index,
  input,
  updateInput,
  deleteInput,
  setIsConfigOpen,
}: DigitalInputProps) => {
  const { dashboardContext } = useContext(DashboardContext);
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state
  const { inputs } = useContext(DigitalInputContext);
  //   const { configDigitalInService } = useRos();

  const handleConfigSave = (updatedInput) => {
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
    if (!dashboardContext.digital_input_config_service) {
      console.error("Service not defined");
      return;
    }

    // Define the request
    const request = new ROSLIB.ServiceRequest({
      channel: updatedInput.channel,
      config: {
        configure: true,
        enable: updatedInput.enabled,
      },
    });

    // Set loading state to true
    setIsLoading(true);

    // Call the config service with timeout
    timeoutServiceCall(dashboardContext.digital_input_config_service, request, 3000)
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

  const handleToggleChange = (e) => {
  // const handleToggleChange = (e: React.ChangeEvent) => {
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

  return (
    // <div style={{ display: "flex", alignItems: "center", height: "40px" }}>
    <div className="flex items-center h-[40px]">
      <div
        // className="input-circle"
        className="bg-slate-200 rounded-[50%] width-[40px] height-[20px] flex justify-center items-center m-[8px]"
        style={{
          backgroundColor: input.value
            ? "rgb(59, 136, 195)"
            : "rgb(200, 200, 200)", // TODO: Global vars for these colors
        }}
      >
        {input.channel}
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

      <Modal
        isOpen={showConfig}
        onClose={() => {
          setShowConfig(false);
          setIsConfigOpen(false);
        }}
      >
        {/* {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )} */}
        {isLoading && (
          <div className="flex fixed inset-0 bg-black/[0.5] z-[9999] justify-center items-center">
            <div className="border-[8px] border-black/[0.3] border-t-[8px] border-t-white rounded-[50%] w-[60px] h-[60px] animate-spin"></div>
          </div>
        )}
        {/* {errorMessage && (
          <div className="error-overlay">
            <div className="error-dialog">
              <p>{errorMessage}</p>
              <button onClick={() => setErrorMessage("")}>Close</button>
            </div>
          </div>
        )} */}
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
        <DigitalInputConfigDialog
          input={input}
          onSave={handleConfigSave}
          onDelete={() => {
            deleteInput();
            setShowConfig(false);
            setIsConfigOpen(false);
          }}
        />
      </Modal>

      {/* <label className="toggle-switch">
        <input
          type="checkbox"
          checked={input.enabled}
          onChange={handleToggleChange}
        />
        <span className="slider"></span>
      </label> */}
      <R2SliderToggle
        text={""}
        state={input.enabled}
        onClick={handleToggleChange}
      />

      {/* <span className="input-label">{input.label}</span> */}
      <span className="m-[8px]">{input.label}</span>
      {/* <div className="vertical-divider"></div>
      <span className="input-type">{input.type}</span> */}
    </div>
  );
};

interface DigitalInputConfigDialogInterface { 
  input: IOPointConfiguration;
  onSave: (updatedInput: IOPointConfiguration) => void;
  onDelete: () => void;
}

const DigitalInputConfigDialog = ({ input, onSave, onDelete }: DigitalInputConfigDialogInterface) => {
  const [localInput, setLocalInput] = useState(input);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalInput({ ...localInput, [name]: value });
  };

  const handleChannelChange = (e) => {
    const { value } = e.target;
    setLocalInput({ ...localInput, channel: parseInt(value) });
  };

  // const handleTypeChange = (e) => {
  //   const { value } = e.target;
  //   setLocalInput({ ...localInput, type: value });
  // };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col mb-[10px]">
        <label>Label</label>
        <input
          type="text"
          name="label"
          value={localInput.label}
          onChange={handleChange}
          className="w-full p-[5px] box-border"
        />
      </div>
      <div className="flex flex-col mb-[10px]">
        <label className="mb-[5px]">Channel</label>
        <select
          name="channel"
          value={localInput.channel}
          onChange={handleChannelChange}
          className="w-full p-[5px] box-border"
        >
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select>
      </div>
      <div className="flex justify-between mt-[20px]">
        <button onClick={onDelete}>Delete</button>
        <button onClick={() => onSave(localInput)}>Save</button>
      </div>
    </div>
  );
};

export default DigitalInput;
