// AnalogInputGroup.js
import React, { useContext, useState } from 'react';
import { AnalogInputContext } from '@/lib/components/client_components/AnalogInputContext';
import AnalogInput from '@/lib/components/client_components/AnalogInput';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
    width: 400,
    borderRadius: '4px'
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="input-group-container">
        <h2>Analog Inputs</h2>
        <Droppable droppableId="analogInputGroup">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
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
        <button onClick={() => addInput({
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
        </button>
      </div>
    </DragDropContext>
  );
};

export default AnalogInputGroup;