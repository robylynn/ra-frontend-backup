// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Icon } from "@blueprintjs/core";
import { ReactNode, useContext } from "react";

import {
  R2AlarmSliderToggle,
  R2Button,
} from "@/lib/reusable_components/client_components/click_button";
import { PagePanel } from "@/lib/reusable_components/client_components/dashboard_header_container";
import DashboardContext from "@/lib/reusable_models/dashboard_context";
import { DatabaseDocumentInterface } from "@/lib/reusable_models/database_models";

function IndicatorLight(props: { text: string; state: boolean }) {
  const indicator_color = props.state ? "red" : "#8F99A8";

  return (
    <>
      <Icon
        icon={"full-circle"}
        className={`p-2`}
        color={indicator_color}
        size={25}
      />
      <p className="p-0 m-0 text-center dark:text-[#ECECEC]/[.83]">
        {props.text}
      </p>
    </>
  );
}

function RoundedContainer(props: { className?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-row px-5 mx-5 space-x-6 border rounded-full border-r2-green-300 place-items-center">
      {props.children}
    </div>
  );
}

export default function Header(props: {
  data_sample?: DatabaseDocumentInterface;
  className?: string;
}) {
  const { context } = useContext(DashboardContext);

  const send_estop_command = async (endpoint_slug: string) => {
    const backend_response = await fetch(
      `/api/command/estop/${endpoint_slug}`,
      {
        method: "POST",
      },
    ).then((res) => res.json());

    console.log(backend_response);
  };

  const send_override_alarm_command = async (value: boolean) => {
    console.log("Overriding global alarms");
    const backend_response = await fetch(
      `/api/command/alarm/global/override?enable=${value}`,
      {
        method: "POST",
      },
    ).then((res) => res.json());

    console.log(backend_response);
  };

  return (
    <PagePanel
      className={`
            flex 
            flex-row 
            justify-between 
            my-1 
            place-items-center
            ${props.className ?? ""}
            `}
    >
      <RoundedContainer>
        <IndicatorLight
          text="MANUAL"
          state={context.latest_document.machine_state == "MANUAL"}
        />
      </RoundedContainer>

      <RoundedContainer className="">
        <IndicatorLight
          text="ALARM"
          state={context.latest_document.alarm_active}
        />
        <IndicatorLight
          text="ESTOP"
          state={context.latest_document.estop_active}
        />
        <R2Button
          text="CLEAR ESTOP"
          onClick={() => {
            send_estop_command("reset");
          }}
          className="p-1 rounded-full w-fit"
        />
        <R2Button
          text="SET ESTOP"
          onClick={() => {
            send_estop_command("set");
          }}
          className="p-1 rounded-full w-fit"
        />
      </RoundedContainer>
      <R2AlarmSliderToggle
        text="ALARM ON"
        state={!context.latest_document.alarms_overridden}
        onClick={() => {
          send_override_alarm_command(
            !context.latest_document.alarms_overridden,
          );
        }}
      />
    </PagePanel>
  );
}
