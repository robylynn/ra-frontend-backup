// DigitalInput.js
import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import Modal from "@/lib/components/client_components/Modal";
import { DigitalInputContext } from "@/lib/components/client_components/DigitalInputContext";
import DashboardContext from "@/lib/models/dashboard_context";
import { IOPointConfiguration, IOPointType } from "@/lib/models/api_models";
// import { useRos } from '../ros/RosContext';
import {
  R2Button,
  R2SliderToggle,
} from "@/lib/components/client_components/ClickButton";
import ROSLIB from "roslib";
import timeoutServiceCall from "@/lib/utils/timeoutServiceCall";
import { IOPointContext } from "./IOPointContext";
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
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state
  // const { inputs } = useContext(DigitalInputContext);
  const { IOPoints } = useContext(IOPointContext);
  //   const { configDigitalInService } = useRos();

  const handleConfigSave = (updatedIOPoint) => {
    console.log("Updated input:", updatedIOPoint);

    // Validate the channel
    const isChannelUsed = IOPoints[updatedIOPoint.type].some(
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
    if (!dashboardContext.IO_config_services[io_point.type]) {
      console.error(`Service for point type ${io_point.type} not defined`);
      return;
    }

    // Define the request
    const request = new ROSLIB.ServiceRequest({
      channel: updatedIOPoint.channel,
      config: {
        configure: true,
        enable: updatedIOPoint.enabled,
      },
    });

    // Set loading state to true
    setIsLoading(true);

    // Call the config service with timeout
    timeoutServiceCall(
      dashboardContext.IO_config_services[io_point.type],
      request,
      3000
    )
      .then((result) => {
        if ((result as any).success) {
          console.log("Service call successful:", result);
          updatePoint(updatedIOPoint);
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

    updatePoint({ ...io_point, enabled: checked });
  };

  return (
    // <div style={{ display: "flex", alignItems: "center", height: "40px" }}>
    <div className="flex items-center h-[40px]">
      <div
        // className="input-circle"
        className="bg-slate-200 rounded-[50%] width-[40px] height-[20px] flex justify-center items-center m-[8px]"
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
              <R2Button text={"Close"} onClick={() => setErrorMessage("")} />
            </div>
          </div>
        )}
        <IOPointConfigDialog
          io_point={io_point}
          onSave={handleConfigSave}
          onDelete={() => {
            deletePoint();
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
        state={io_point.enabled}
        onClick={handleToggleChange}
      />

      {/* <span className="input-label">{input.label}</span> */}
      <span className="m-[8px]">{io_point.label}</span>
      {/* <div className="vertical-divider"></div>
      <span className="input-type">{input.type}</span> */}
    </div>
  );
};

interface DigitalInputConfigDialogInterface {
  io_point: IOPointConfiguration;
  onSave: (updatedInput: IOPointConfiguration) => void;
  onDelete: () => void;
}

const IOPointConfigDialog = ({
  io_point,
  onSave,
  onDelete,
}: DigitalInputConfigDialogInterface) => {
  const [localPoint, setLocalPoint] = useState(io_point);
  const { dashboardContext } = useContext(DashboardContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalPoint({ ...localPoint, [name]: value });
  };

  const handleChannelChange = (e) => {
    const { value } = e.target;
    setLocalPoint({ ...localPoint, channel: parseInt(value) });
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
          value={localPoint.label}
          onChange={handleChange}
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
                dashboardContext.hardware_configuration.io_system
                  .configuration_constants[io_point.type]
              ).keys(),
            ].map((i) => (
              <option value={i}>{i}</option>
            ))
            // [...Array(max_number_of_channels).keys()]
          }
          {/* <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option> */}
        </select>
      </div>
      <div className="flex justify-between mt-[20px]">
        <button onClick={onDelete}>Delete</button>
        <button onClick={() => onSave(localPoint)}>Save</button>
      </div>
    </div>
  );
};

export default IOPointContainer;
