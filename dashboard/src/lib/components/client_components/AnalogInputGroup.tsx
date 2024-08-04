// Frontend Web Application for RA Products
// Developed by R2 Labs

// AnalogInputGroup.js
import React, { useContext, useState } from 'react';
import { AnalogInputContext } from '@/lib/components/client_components/AnalogInputContext';
import AnalogInput from '@/lib/components/client_components/AnalogInput';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { R2Button } from './click_button';
import { IOPointType, TransferFunctionType } from '@/lib/models/api_models';

const AnalogInputGroup = () => {
  const { inputs, setInputs, addInput, updateInput, deleteInput } = useContext(AnalogInputContext);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newInputs = Array.from(inputs);
    const [movedInput] = newInputs.splice(result.source.index, 1);
    newInputs.splice(result.destination.index, 0, movedInput);

    setInputs(newInputs);
  };

  const grid = 8;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: 4,
    margin: `0 0 ${grid}px 0`,
    borderRadius: '4px',

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 600,
    borderRadius: '4px'
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* <div className="input-group-container"> */}
      <div className="w-full">
        {/* <h2>Analog Inputs</h2> */}
        <div className='flex flex-row justify-between'>
          <p className='text-white font-bold'>Analog Inputs</p>
          <R2Button
            text={"Add Analog Input"}
            className='w-[180px]'
            onClick={
              () => addInput({
                id: '',
                label: 'Analog Input',
                type: IOPointType.ANALOG_VOLTAGE_INPUT,
                channel: 0,
                transfer_function_type: TransferFunctionType.LINEAR,
                // transfer: 'linear',
                measurement_unit: '',
                // measurementUnit: '',
                min_value: 0,
                min_signal_v: 0,
                max_value: 0,
                max_signal_v: 0,
                
                // minValue: 0,
                // minSignal: 0,
                // maxValue: 0,
                // maxSignal: 0,
                value: 0,
                enabled: false })
            }
          />
        </div>
        
        <Droppable droppableId="analogInputGroup">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              // style={getListStyle(snapshot.isDraggingOver)}
              className={`${snapshot.isDraggingOver ? "bg-sky-300" : "bg-slate-300"} grid grid-cols-1 w-full rounded-[4px]`}
            >
              {inputs.map((input, index) => (
                <Draggable key={input.id} draggableId={input.id} index={index} isDragDisabled={isConfigOpen}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                    )}
                    >
                      <AnalogInput
                        index={index}
                        input={input}
                        updateInput={(updatedInput) => updateInput(index, updatedInput)}
                        deleteInput={() => deleteInput(index)}
                        setIsConfigOpen={setIsConfigOpen}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {/* <button onClick={() => addInput({
          label: 'Analog Input',
          type: 'Voltage',
          channel: 0,
          transfer: 'linear',
          measurementUnit: '',
          minValue: 0,
          minSignal: 0,
          maxValue: 0,
          maxSignal: 0,
          value: 0,
          enabled: false })}>
            Add Input
        </button> */}
        
      </div>
    </DragDropContext>
  );
};

export default AnalogInputGroup;