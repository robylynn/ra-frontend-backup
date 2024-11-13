"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  ReactNode,
} from "react";
// import DashboardContext from "@/lib/models/dashboard_context";
import { DashboardContext } from "./DashboardContextWrapper";
import { Topic } from "roslib";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { IOPointConfiguration, IOPointType } from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";

const IODisplay = () => {
  const { dashboardContext } = useContext(DashboardContext);
  const { IOPoints } = useContext(IOPointContext);

  const interpolateColor = (value) => {
    const startColor = [169, 169, 169]; // RGB for gray
    const endColor = [59, 136, 195]; // RGB for #3B88C3
    const ratio = value / 10;

    const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // console.log("rendering display")
  // useEffect(() => {
  //   console.log("analog data updated in display")
  // }, [dashboardContext.analog_in_data?.values?.[0]])

  // const [testUpdateCounter, setTestUpdateCounter] = useState(0);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setTestUpdateCounter((counter) => counter + 1);
  //     console.log("test ionterval")
  //   }, 0.1 * 1000);
  //   return () => clearInterval(intervalId);
  // }, []);

  // useEffect(() => {
  //   console.log("got new context in display")
  // }, [dashboardContext.analog_in_data?.values?.[0]])

  const IODisplayElementContainer = (props: { children: ReactNode }) => {
    return (
      <div className="items-center justify-center border m-1 rounded grid grid-cols-3">
        {props.children}
      </div>
    );
  };

  const IODisplayElementCell = (props: { header: string; text: string }) => {
    return (
      <div className="flex flex-col items-center">
        <p className="text-sm dark:text-r2-gray-300">{props.header}</p>
        <p className="dark:text-r2-white">{props.text}</p>
      </div>
    );
  };

  const AnalogValueDisplayElement = (props: { value: number }) => {
    return (
      <div className="flex flex-row items-center justify-center">
        <p className="p-1 dark:text-r2-gray-300">Value</p>
        <div
          className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300`}
          style={{ backgroundColor: interpolateColor(props.value) }}
        >
          <p>{props.value?.toFixed(2)}</p>
        </div>
      </div>
    );
  };

  const DigitalValueDisplayElement = (props: { value: boolean }) => {
    return (
      <div className="flex flex-row items-center justify-center">
        <p className="p-1 dark:text-r2-gray-300">Value</p>
        <div
          className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300 ${props.value ? "bg-r2-green-300" : "bg-r2-red-300"}`}
          // style={{ backgroundColor: props.value ? "" }}
        >
          <p>{props.value.toString()}</p>
        </div>
      </div>
    );
  };

  const AnalogInputDisplayElement = (props: {
    configuration: IOPointConfiguration;
  }) => {
    const point_value = dashboardContext.getIOSState(props.configuration.type)
      ?.values[props.configuration.channel] as number;
    return (
      // <div className="items-center justify-center border m-1 rounded grid grid-cols-3">
      <IODisplayElementContainer>
        <IODisplayElementCell
          header="Point Label"
          text={props.configuration.label}
        />
        <IODisplayElementCell
          header="Unit"
          text={
            props.configuration.measurement_unit != ""
              ? props.configuration.measurement_unit
              : "Unknown"
          }
        />
        {/* <div className="flex flex-col items-center">
          <p className="text-sm dark:text-r2-gray-300">Point Label</p>
          <p className="dark:text-r2-white">{props.configuration.label}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm dark:text-r2-gray-300">Unit</p>
          <p className="dark:text-r2-white">
            {props.configuration.measurement_unit != ""
              ? props.configuration.measurement_unit
              : "Unknown"}
          </p>
        </div> */}
        {props.configuration.type == IOPointType.ANALOG_INPUT ? (
          <AnalogValueDisplayElement value={point_value}/>
          // <div className="flex flex-row items-center justify-center">
          //   <p className="p-1 dark:text-r2-gray-300">Value</p>
          //   <div
          //     className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300`}
          //     style={{ backgroundColor: interpolateColor(point_value) }}
          //   >
          //     <p>{point_value?.toFixed(2)}</p>
          //   </div>
          // </div>
        ) : (
          <></>
        )}
        {props.configuration.type == IOPointType.DIGITAL_INPUT ? (
          <DigitalValueDisplayElement value={point_value > 0 ? true : false}/>
          // <div className="flex flex-row items-center justify-center">
          //   <p className="p-1 dark:text-r2-gray-300">Value</p>
          //   <div
          //     className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300`}
          //     style={{ backgroundColor: interpolateColor(point_value) }}
          //   >
          //     <p>{point_value?.toFixed(2)}</p>
          //   </div>
          // </div>
        ) : (
          <></>
        )}
      </IODisplayElementContainer>
    );
  };

  return (
    <div className="w-full">
      <h2>Analog Inputs</h2>
      {/* <h2>{dashboardContext.analog_in_data?.values?.[0]}</h2> */}
      <div className="flex flex-col w-full">
        {[IOPointType.ANALOG_INPUT, IOPointType.DIGITAL_INPUT].map(
          (io_point_type) =>
            IOPoints?.getConfiguredIOPoints(io_point_type).map(
              (configuration) => (
                <AnalogInputDisplayElement configuration={configuration} />
              )
            )
        )}
        {/* {dashboardContext.analog_in_data ? (
          // dashboardContext.hardware_configuration?.io_system
          IOPoints?.getConfiguredIOPoints(IOPointType.ANALOG_INPUT).map(
            (configuration) => (
              <AnalogInputDisplayElement configuration={configuration} />
              // const point_value = dashboardContext.getIOSState(
              //   IOPointType.ANALOG_INPUT
              // )?.values[configuration.channel] as number;
              // return (
              //   <div className="items-center justify-center border m-1 rounded grid grid-cols-3">
              //     <div className="flex flex-col items-center">
              //       <p className="text-sm dark:text-r2-gray-300">Point Label</p>
              //       <p className="dark:text-r2-white">{configuration.label}</p>
              //     </div>
              //     <div className="flex flex-col items-center">
              //       <p className="text-sm dark:text-r2-gray-300">Unit</p>
              //       <p className="dark:text-r2-white">
              //         {configuration.measurement_unit != ""
              //           ? configuration.measurement_unit
              //           : "Unknown"}
              //       </p>
              //     </div>
              //     <div className="flex flex-row items-center justify-center">
              //       <p className="p-1 dark:text-r2-gray-300">Value</p>
              //       <div
              //         className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300`}
              //         style={{ backgroundColor: interpolateColor(point_value) }}
              //       >
              //         <p>{point_value.toFixed(2)}</p>
              //       </div>
              //     </div>
              //   </div>
              // );
            )
          )
        ) : (
          <></>
        )} */}
      </div>
      {dashboardContext.ra_ros_websocket ? (
        <div
          key="v2"
          className="flex flex-row justify-around gap-[10px] max-w-[100%] grow"
        >
          {dashboardContext.analog_in_data?.values?.map((value, index) => (
            <div
              key={index}
              className="flex flex-col items-center h-full items-center justify-center"
            >
              <h3>{index}</h3>
              <div
                className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-white transition ease-in-out delay-300`}
                style={{ backgroundColor: interpolateColor(value) }}
              >
                <p>{value.toFixed(2)}</p>
              </div>
              {/* <p>Type: {types[index]}</p> */}
              <p>Type: {dashboardContext.analog_in_data.types[index]}</p>
            </div>
          ))}
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  );
};

export default IODisplay;
