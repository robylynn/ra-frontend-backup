"use client";

import React, { useContext, ReactNode, useMemo } from "react";
import { DashboardContext } from "./DashboardContextWrapper";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { IOPointConfiguration, IOPointType } from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import { IOPointTypeFriendlyName } from "@/lib/models/api_models";

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

  const latestIOConfiguration = useMemo(
    () => dashboardContext.hardware_configuration?.io_system,
    [JSON.stringify(dashboardContext?.hardware_configuration?.io_system)]
  );

  const IODisplayElementContainer = (props: { children: ReactNode, enabled: boolean }) => {
    return (
      <div className={`items-center justify-center border m-1 rounded grid grid-cols-3 ${props.enabled ? "bg-slate-500" : "bg-slate-700"}`}>
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

  const AnalogValueDisplayElement = (props: {
    value: number;
    enabled: boolean;
  }) => {
    return (
      <div className="flex flex-row items-center justify-center">
        {props.enabled ? (
          <>
            <p className="p-1 dark:text-r2-gray-300">Value</p>
            <div
              className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300`}
              style={{ backgroundColor: interpolateColor(props.value) }}
            >
              <p>{props.value?.toFixed(2)}</p>
            </div>
          </>
        ) : (
          <p>DISABLED</p>
        )}
      </div>
    );
  };

  const DigitalValueDisplayElement = (props: {
    value: boolean;
    enabled: boolean;
  }) => {
    return (
      <div className="flex flex-row items-center justify-center">
        {props.enabled ? (
          <>
            <p className="p-1 dark:text-r2-gray-300">Value</p>
            <div
              className={`flex w-[40px] h-[40px] rounded-[50%] items-center justify-center text-r2-white transition ease-in-out delay-300 ${props.value ? "bg-r2-green-300" : "bg-r2-red-300"}`}
            >
              <p>{props.value.toString()}</p>
            </div>
          </>
        ) : (
          <p>DISABLED</p>
        )}
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
      <IODisplayElementContainer enabled={props.configuration.enabled}>
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
        {props.configuration.type == IOPointType.ANALOG_INPUT ? (
          <AnalogValueDisplayElement
            enabled={props.configuration.enabled}
            value={point_value}
          />
        ) : (
          <></>
        )}
        {props.configuration.type == IOPointType.DIGITAL_INPUT ? (
          <DigitalValueDisplayElement
            enabled={props.configuration.enabled}
            value={point_value > 0 ? true : false}
          />
        ) : (
          <></>
        )}
      </IODisplayElementContainer>
    );
  };

  return (
    <div className="w-full">
      {/* <h2>Analog Inputs</h2> */}
      {/* <h2>{dashboardContext.analog_in_data?.values?.[0]}</h2> */}
      {dashboardContext.ra_ros_websocket ? (
        <div className="flex flex-col w-full items-center">
          {[IOPointType.ANALOG_INPUT, IOPointType.DIGITAL_INPUT].map(
            (io_point_type, display_index) => {
              return (
                <div key={display_index} className="border rounded w-full m-2">
                  <p className="text-r2-white font-bold">{`${IOPointTypeFriendlyName[io_point_type].toString()}s`}</p>
                  {IOPoints?.getConfiguredIOPoints(io_point_type).map(
                    (configuration, point_index) => (
                      <AnalogInputDisplayElement
                      key={point_index}  
                      configuration={configuration}
                      />
                    )
                  )}
                </div>
              );
            }
          )}
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  );
};

export default IODisplay;
