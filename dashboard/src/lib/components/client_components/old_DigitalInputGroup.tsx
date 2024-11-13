// Frontend Web Application for RA Products
// Developed by R2 Labs

// DigitalInputGroup.js
import React, { useContext, useState } from 'react';
import { DigitalInputContext } from '@/lib/components/client_components/DigitalInputContext';
import DigitalInput from '@/lib/components/client_components/DigitalInput';
import { HardwareConfiguration, IOPointConfiguration, IOPointType } from '@/lib/models/api_models';
import { R2Button } from '@/lib/components/client_components/ClickButton';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DropResult } from 'react-beautiful-dnd';

const DigitalInputGroup = () => {
  const { inputs, setInputs, addInput, updateInput, deleteInput } = useContext(DigitalInputContext);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newInputs = Array.from(inputs);
    const [movedInput] = newInputs.splice(result.source.index, 1);
    newInputs.splice(result.destination.index, 0, movedInput);

    setInputs(newInputs);
  };

  const grid = 8;

//   const getItemStyle = (isDragging: boolean, draggableStyle: StylePropertyMap) => ({
    const getItemStyle = (isDragging: boolean, draggableStyle: React.CSSProperties) => ({
    // some basic styles to make the items look a bit nicer
    // userSelect: "none",
    userSelect: null,
    padding: 4,
    margin: `0 0 ${grid}px 0`,
    borderRadius: '4px',
  
    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",
  
    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 400,
    borderRadius: '4px'
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* <div className="input-group-container"> */}
      <div className="w-full">
        <div className='flex flex-row justify-between'>
            <p className='text-white font-bold'>Digital Inputs</p>
            <R2Button
                text={"Add Digital Input"}
                className='w-[180px]'
                onClick={
                    () => addInput({
                    id: '',
                    label: 'Digital Input',
                    type: IOPointType.DIGITAL_INPUT,
                    channel: 0,
                    // transfer_function_type: TransferFunctionType.LINEAR,
                    measurement_unit: '',
                    min_value: 0,
                    min_signal_v: 0,
                    max_value: 0,
                    max_signal_v: 0,
                    value: 0,
                    enabled: false })
                }
            />
        </div>
        <Droppable droppableId="digitalInputGroup">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
            //   style={getListStyle(snapshot.isDraggingOver)}
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
                      <DigitalInput
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
          label: 'Digital Input',
          channel: 0,
          value: 0,
          enabled: false })}>
            Add Input
        </button> */}
      </div>
    </DragDropContext>
  );
};

export default DigitalInputGroup;