// Frontend Web Application for RA Products
// Developed by R2 Labs

// AnalogInputContext.js
import React, { createContext, useState, Dispatch, SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique IDs
import { IOPointConfiguration } from '@/lib/models/api_models';

interface AnalogInputContextInterface { 
  inputs: Array<IOPointConfiguration>;
  setInputs: Dispatch<SetStateAction<Array<IOPointConfiguration>>>;
  addInput: (input: IOPointConfiguration) => void, 
  updateInput: (index: number, updatedInput: IOPointConfiguration) => void, 
  deleteInput: (index: number) => void
}


export const AnalogInputContext = createContext<AnalogInputContextInterface>(null);

export const AnalogInputProvider = ({ children }) => {
  const [inputs, setInputs] = useState<Array<IOPointConfiguration>>([]);

  const addInput = (input: IOPointConfiguration) => {
    if (inputs.length >= 4) return; // TODO: Add a global var for number of inputs

    // Find the first available channel
    const usedChannels = inputs.map(input => input.channel);
    const availableChannel = [0, 1, 2, 3].find(channel => !usedChannels.includes(channel));

    setInputs([...inputs, { ...input, id: uuidv4(), channel: availableChannel }]);
  };

  const updateInput = (index: number, updatedInput: IOPointConfiguration) => {
    const newInputs = inputs.map((input, i) => (i === index ? updatedInput : input));
    setInputs(newInputs);
  };

  const deleteInput = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  return (
    <AnalogInputContext.Provider value={{ inputs, setInputs, addInput, updateInput, deleteInput }}>
      {children}
    </AnalogInputContext.Provider>
  );
};