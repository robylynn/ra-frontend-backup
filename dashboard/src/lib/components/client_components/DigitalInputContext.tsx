// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, {
    createContext,
    useState,
    Dispatch,
    SetStateAction
  } from "react";
  import { v4 as uuidv4 } from "uuid"; // Import uuid to generate unique IDs
  import { IOPointConfiguration, IOPointConfigurationInterface } from "@/lib/models/api_models";


interface DigitalInputContextInterface {
    inputs: Array<IOPointConfiguration>;
    setInputs: Dispatch<SetStateAction<Array<IOPointConfiguration>>>;
    addInput: (input: IOPointConfigurationInterface) => void;
    updateInput: (index: number, updatedInput: IOPointConfiguration) => void;
    deleteInput: (index: number) => void;
  }

// export const DigitalInputContext = createContext();
export const DigitalInputContext =
  createContext<DigitalInputContextInterface>(null);

export const DigitalInputProvider = ({ children }) => {
  const [inputs, setInputs] = useState<Array<IOPointConfiguration>>([]);

  const addInput = (input: IOPointConfiguration) => {
    if (inputs.length >= 8) return; // TODO: Add a global var for number of inputs

    // Find the first available channel
    const usedChannels = inputs.map(input => input.channel);
    const availableChannel = [0, 1, 2, 3, 4, 5, 6, 7].find(channel => !usedChannels.includes(channel));

    setInputs([...inputs, { ...input, id: uuidv4(), channel: availableChannel }]);
  };

  const updateInput = (index: number, updatedInput: IOPointConfiguration) => {
    const newInputs = inputs.map((input, i) => (i === index ? updatedInput : input));
    setInputs(newInputs);
  };

  const deleteInput = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  return (
    <DigitalInputContext.Provider value={{ inputs, setInputs, addInput, updateInput, deleteInput }}>
      {children}
    </DigitalInputContext.Provider>
  );
};