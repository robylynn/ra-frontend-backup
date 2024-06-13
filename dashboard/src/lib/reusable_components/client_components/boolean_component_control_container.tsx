// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Icon } from "@blueprintjs/core";
import { useContext } from "react";

import { R2Button } from "@/lib/reusable_components/client_components/click_button";
import DashboardContext from "@/lib/reusable_models/dashboard_context";

export default function BooleanComponentControlContainer(props: {
  title: string;
  pid_tag?: string;
  component_name: string;
  parameter: string;
  true_text: string;
  false_text: string;
}) {
  const { context } = useContext(DashboardContext);

  const parameter_state = context.latest_document.GetComponentParameterState(
    props.component_name,
    props.parameter,
  ) as boolean;

  const indicator_color = parameter_state ? "green" : "red";

  const post_command = async (value: boolean) => {
    const query = new URLSearchParams({ value: value.toString() });
    const response = await fetch(
      `/api/command/component/${props.component_name}/${props.parameter}?` +
        query,
      {
        method: "POST",
      },
    ).then((res) => res.json());

    console.log(response);
  };

  return (
    <div className="flex flex-col p-2 mx-2 my-2 border rounded shadow-md border-r2-purple-500 dark:bg-r2-dark-background-400 dark:text-r2-white">
      <p className="font-bold">{`${props.title} (${props.pid_tag ?? "NA"})`}</p>
      <div className="flex flex-row space-x-5">
        {/* <Image
                    src={"/icons/circle.svg"}
                    width={25}
                    height={25}
                    alt=""
                    className='fill-red-500'
                /> */}
        <Icon
          icon={"full-circle"}
          className=""
          size={25}
          color={indicator_color}
        />
        <div className="grid w-full grid-cols-2 p-0 m-0 gap-x-2">
          <R2Button
            text={props.true_text}
            onClick={() => post_command(true)}
            className="w-full"
          />
          <R2Button
            text={props.false_text}
            onClick={() => post_command(false)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
