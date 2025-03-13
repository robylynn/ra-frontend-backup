// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client"

import React, { useEffect, useContext, useState } from "react";
import IOPointContainer, { callConfigService } from "@/lib/components/client_components/IOPointContainer";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import {
  IOPointConfiguration,
  IOPointType
} from "@/lib/models/api_models";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DropResult } from "react-beautiful-dnd";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import { IRosTypeR2CInterfacesAnalogInConfigConst, IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType } from "@/lib/models/ros_types";

interface IOPointGroupInterface {
  point_type: IOPointType;
  group_name: string;
  setLoading?: (loading: boolean) => void;
  setErrorMessage?: (error: string) => void;
}

const IOPointGroup = ({ point_type, group_name, setLoading, setErrorMessage}: IOPointGroupInterface) => {
  const { IOPoints, setIOPoints } =
    useContext(IOPointContext);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { dashboardContext } = useContext(DashboardContext);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    if (dashboardContext.hardware_configuration) {
      if (!IOPoints.initialized) {
        let config = dashboardContext.hardware_configuration.io_system.copy();
        config.assignUUIDs();
        setIOPoints({ payload: { configuration: config }, type: "config/set" });
      }
    }
  }, [dashboardContext.heartbeat_counter]);

  const addDigitalInput = () => {

    let point_index = IOPoints.getNextAvailablePointIndex(
      IOPointType.DIGITAL_INPUT
    );

    setLoading(true);

    if (point_index >= 0) {
      const newIOPoint = new IOPointConfiguration({
        id: "",
        label: "Digital Input",
        type: IOPointType.DIGITAL_INPUT,
        channel: point_index,
        configured: true, 
        measurement_unit: "",
        min_value: 0,
        min_signal_v: 0,
        max_value: 0,
        max_signal_v: 0,
        value: 0,
        enabled: false,
      })

      callConfigService(
        dashboardContext,
        newIOPoint,
        () => {
          setIOPoints({
            payload: { point: newIOPoint },
            type: "config/add",
          });
          console.log("Digital Input sent to ROS");
        },
        () => {
          setLoading(false);
          console.log("Digital Input add completed")
        },
        true,
        false
      ).catch((error) => {
        console.error("Error adding Digital Input");
        setLoading(false);
        setErrorMessage(error.toString() || "Unknown error occurred");      
      });
    }
  };

  const addAnalogInput = () => {
    let point_index = IOPoints.getNextAvailablePointIndex(
      IOPointType.ANALOG_INPUT
    );

    setLoading(true);

    if (point_index >= 0) {
      const newIOPoint = new IOPointConfiguration({
        id: "",
        label: "Analog Input",
        type: IOPointType.ANALOG_INPUT,
        analog_type: IRosTypeR2CInterfacesAnalogInHardwareConfigChannelType.CHANNEL_TYPE_VOLTAGE,
        channel: point_index,
        configured: true,
        transfer_function_type: IRosTypeR2CInterfacesAnalogInConfigConst.TRANSFER_FUNCTION_LINEAR,
        measurement_unit: "",
        min_value: 0,
        min_signal_v: 0,
        max_value: 0,
        max_signal_v: 0,
        value: 0,
        enabled: false,
      })

      callConfigService(
        dashboardContext,
        newIOPoint,
        () => {
          setIOPoints({
            payload: { point: newIOPoint },
            type: "config/add",
          });
          console.log("Analog Input sent to ROS");
        },
        () => {
          setLoading(false);
          console.log("Analog Input add completed")
        },
        true,
        false
      ).catch((error) => {
        console.error("Error adding Analog Input");
        setLoading(false);
        setErrorMessage(error.toString() || "Unknown error occurred");      
      });

    }
  };

  const addButtonCallback = (point_type: IOPointType): (() => void) => {
    switch (point_type) {
      case IOPointType.DIGITAL_INPUT: {
        return addDigitalInput;
      }
      case IOPointType.ANALOG_INPUT: {
        return addAnalogInput;
      }
      default: {
        return () => {};
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const destinationPointChannel = IOPoints.getConfiguredIOPoints(point_type)[result.destination.index].channel;
    const sourcePointChannel = IOPoints.getConfiguredIOPoints(point_type)[result.source.index].channel;
    setIOPoints({
      payload: {
        destination_channel: destinationPointChannel,
        source_channel: sourcePointChannel,
        point_type: point_type,
      },
      type: "config/reorder",
    });
  };

  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: React.CSSProperties
  ) => ({
    // some basic styles to make the items look a bit nicer
    // userSelect: "none",
    userSelect: null,
    padding: 4,
    margin: `4px`,
    borderRadius: "4px",

    // change background colour if dragging, this is green-300 and slate-500
    background: isDragging ? "rgb(134 239 172)" : "rgb(100 116 139)",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  // useEffect(() => {
  //   console.log("updates points");
  // }, [IOPoints.analog_inputs]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="w-full">

        <div className="flex flex-row grid grid-cols-[92%_8%]">
          <p className="text-white font-bold px-2 py-2">{`${group_name}s`}</p>
          <div className="relative group p-2">
            <button
              className="w-6 h-6 flex items-center justify-center bg-gray-200 border border-black shadow-md text-white rounded-full shadow-md hover:bg-green-400 transition"
              onClick={() => addButtonCallback(point_type)()}
            >
              ➕
            </button>

            {/* Hover Tooltip */}
            <span
              className="absolute 
              right-full
              top-1/2 -translate-y-1/2
              px-2 
              py-1 
              text-sm 
              text-white 
              bg-gray-800 
              rounded-md 
              shadow-md 
              opacity-0 
              group-hover:opacity-100 
              transition"
            >
              {"Add " + group_name}
            </span>
          </div>
        </div>
        <Droppable droppableId="digitalInputGroup">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`${snapshot.isDraggingOver ? "bg-sky-300" : "bg-slate-300"} grid grid-cols-1 w-full rounded-[4px]`}
            >
              {IOPoints?.getConfiguredIOPoints(point_type)
                .filter((p) => p.label)
                .map((point, index) => (
                  <Draggable
                    key={point.id}
                    draggableId={point.id}
                    index={index}
                    isDragDisabled={isConfigOpen}
                  >
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
                        <IOPointContainer
                          index={index}
                          io_point={point}
                          updatePoint={(updatedPoint) =>
                            setIOPoints({
                              payload: {
                                point: updatedPoint,
                                index: index
                              },
                              type: 'config/update'
                            })
                          }
                          deletePoint={() => {
                            setIOPoints({
                              payload: {
                                point: point,
                                index: index
                              },
                              type: 'config/delete'
                            })
                          }}
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
      </div>
    </DragDropContext>
  );
};

export default IOPointGroup;
