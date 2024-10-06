// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { v4 as uuidv4 } from "uuid"; // Import uuid to generate unique IDs
import {
  IOPointConfiguration,
  IOPointConfigurationInterface,
  IOPointType,
} from "@/lib/models/api_models";
import DashboardContext from "@/lib/models/dashboard_context";

// interface IOPointContextInterface {
//   points: Array<IOPointConfiguration>;
//   setPoints: Dispatch<SetStateAction<Array<IOPointConfiguration>>>;
//   addPoint: (input: IOPointConfigurationInterface) => void;
//   updatePoint: (index: number, updatedInput: IOPointConfiguration) => void;
//   deletePoint: (index: number) => void;
// }

interface IOPointContextInterface {
  IOPoints: Record<IOPointType, Array<IOPointConfiguration>>;
  setIOPoints: Dispatch<SetStateAction<Record<IOPointType, Array<IOPointConfiguration>>>>;
  addIOPoint: (point: IOPointConfigurationInterface) => void;
  updateIOPoint: (index: number, updatedPoint: IOPointConfiguration) => void;
  deleteIOPoint: (index: number, point_type: IOPointType) => void;
}

// export const DigitalInputContext = createContext();
export const IOPointContext = createContext<IOPointContextInterface>(null);

// enum IOPointContextClass {
//   DIGITAL_INPUT,
//   DIGITAL_OUTPUT,
//   ANALOG_INPUT,
//   ANALOG_OUTPUT,
// }

export const IOPointContextProvider = ({ children }) => {
  //   const [inputs, setInputs] = useState<Array<IOPointConfiguration>>([]);
  const { dashboardContext } = useContext(DashboardContext);
  const [IOPoints, setIOPoints] = useState<
    Record<IOPointType, Array<IOPointConfiguration>>
  >({
    [IOPointType.DIGITAL_INPUT]: [],
    [IOPointType.DIGITAL_OUTPUT]: [],
    [IOPointType.ANALOG_INPUT]: [],
    [IOPointType.ANALOG_OUTPUT]: [],
    [IOPointType.NULL]: []
  });

  const addIOPoint = (point: IOPointConfiguration) => {
    let max_number_of_channels = dashboardContext.hardware_configuration.io_system.configuration_constants[point.type];
    if (IOPoints[point.type].length > max_number_of_channels) return;
    // if (inputs.length >= 8) return; // TODO: Add a global var for number of inputs

    // Find the first available channel
    const usedChannels = IOPoints[point.type].map((point) => point.channel);
    // let channels = [...Array(max_number_of_inputs).keys()]
    const availableChannel = [...Array(max_number_of_channels).keys()].find(
        (channel) => !usedChannels.includes(channel)
      );
    // const availableChannel = [0, 1, 2, 3, 4, 5, 6, 7].find(
    //   (channel) => !usedChannels.includes(channel)
    // );

    setIOPoints({
        ...IOPoints,
        [point.type]: [...IOPoints[point.type], { ...point, id: uuidv4(), channel: availableChannel }]
        // { ...input, id: uuidv4(), channel: availableChannel },
    });

    // setInputs([
    //   ...inputs,
    //   { ...input, id: uuidv4(), channel: availableChannel },
    // ]);
  };

//   const updateInput = (index: number, updatedInput: IOPointConfiguration) => {
//     const newInputs = inputs.map((input, i) =>
//       i === index ? updatedInput : input
//     );
//     setInputs(newInputs);
//   };

  const updateIOPoint = (index: number, updatedPoint: IOPointConfiguration) => {
    const newPoints = IOPoints[updatedPoint.type].map((input, i) =>
      i === index ? updatedPoint : input
    );
    setIOPoints({...IOPoints, [updatedPoint.type]: newPoints});
  };

//   const deleteInput = (index: number) => {
//     const newInputs = inputs.filter((_, i) => i !== index);
//     setInputs(newInputs);
//   };
  
const deleteIOPoint = (index: number, point_type: IOPointType) => {
    const newInputs = IOPoints[point_type].filter((_, i) => i !== index);
    setIOPoints({...IOPoints, [point_type]: newInputs});
  };

  return (
    <IOPointContext.Provider
      value={{ IOPoints: IOPoints, setIOPoints: setIOPoints, addIOPoint, updateIOPoint: updateIOPoint, deleteIOPoint: deleteIOPoint }}
    >
      {children}
    </IOPointContext.Provider>
  );
};
