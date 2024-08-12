// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import Image from "next/image";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { MutableRefObject } from "react";

export function PagePanel(props: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={`
        my-1
        bg-light-box-background 
        dark:bg-r2-dark-background-500/[.85] 
        shadow-[2px_4px_35px_0px_#70727C] 
        rounded-lg 
        w-[100%] 
        border 
        border-r2-green-300
        
        py-2
        ${props.className ?? ""}
        `}
    >
      {props.children}
    </div>
  );
}

export function DashboardHeaderContainer(props: {
  ref?: MutableRefObject<boolean>;
  header_text: string;
  icon_path: string;
  className?: string;
  children: ReactNode;
  fill_tile_id: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  expansion_state?: boolean;
  set_expansion_state?: Dispatch<SetStateAction<boolean>>;
}) {
  let expansionState: boolean;
  let setExpansionState: Dispatch<SetStateAction<boolean>>;
  [expansionState, setExpansionState] = useState<boolean>(false);
  if (
    !(props.expansion_state == undefined) &&
    !(props.set_expansion_state == undefined)
  ) {
    expansionState = props.expansion_state as boolean;
    setExpansionState = props.set_expansion_state as Dispatch<
      SetStateAction<boolean>
    >;
  }

  return (
    <div
      className={`flex flex-col rounded-xl mx-2 bg-r2-dark-background-300 h-full transition-all duration-200 active:bg-gray-500 ${
        props.className ?? ""
      }`}
    >
      <div className="flex flex-row items-center p-2 rounded-xl group">
        <Image
          src={props.icon_path}
          alt={props.header_text}
          className="dark:invert"
          width={20}
          height={20}
          priority
        />
        <p className="p-0 px-2 m-0 font-bold text-sm dark:text-white/[0.88] peer-checked/control:text-black">
          {props.header_text}
        </p>
        {props.fill_tile_callback != undefined ? (
          <input
            id="control_fullscreen"
            type="checkbox"
            className="peer/control"
            onClick={() => {
              props.fill_tile_callback?.(() =>
                !expansionState ? props.fill_tile_id : "",
              );
              setExpansionState(() => !expansionState);
            }}
          />
        ) : (
          <></>
        )}
      </div>
      {/* <div className="h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400 overflow-y-auto"> */}
      <div className="h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400">
        {props.children}
      </div>
    </div>
  );
}
