// Frontend Web Application for RA Products
// Developed by R2 Labs

"use-client";

import { MouseEventHandler } from "react";

export function R2Button(props: {
  text: string;
  onClick: React.MouseEventHandler;
  className?: string;
  disabled?: boolean
}) {
  return (
    <button
      className={`border-2 rounded-lg hover:dark:bg-slate-300 active:border-purple-500 dark:bg-r2-white/[.61] disabled:dark:bg-slate-600 ${
        props.className ?? ""
      }`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  );
}

export function R2ToggleButton(props: {
  text: string;
  onClick: React.MouseEventHandler;
  state: boolean;
  on_color?: string;
  off_color?: string;
  className?: string;
}) {
  const color = props.state
    ? props.on_color ?? "dark:!bg-r2-green-500/[.61]"
    : props.off_color ?? "dark:!bg-r2-red-300/[.61]";
  return (
    <button
      className={`border-2 rounded-lg w-[50px] active:border-purple-500 ${
        props.className ?? ""
      } ${color} hover:dark:bg-slate-300`}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
}

export function R2AlarmSliderToggle(props: {
  text: string;
  state: boolean;
  onClick?: MouseEventHandler;
}) {
  return (
    <label className="relative flex items-center justify-between p-4 text-lg group">
      <input
        type="checkbox"
        className="absolute w-full h-full -translate-x-1/2 rounded-md appearance-none left-1/2 peer"
        onClick={props.onClick}
        checked={props.state}
        onChange={() => {}}
      />
      <span
        id={props.text}
        className="w-48 
                            h-10 
                            flex 
                            items-center 
                            flex-shrink-0 
                            ml-4 
                            text-black
                            text-center
                            after:leading-9
                            border-2
                            border-red-600
                            bg-r2-gray-300 
                            rounded-full 
                            duration-300 
                            ease-in-out 
                            after:w-32 after:h-10
                            peer-checked:before:bg-white
                            peer-checked:after:bg-r2-red-300
                            after:rounded-full 
                            after:shadow-md 
                            after:duration-300 
                            after:border-2
                            after:border-r2-red-300
                            peer-checked:after:translate-x-16
                            group-hover:after:translate-x-1 
                            after:content-[attr(id)]
                            "
      ></span>
    </label>
  );
}

export function R2SliderToggle(props: {
  text: string;
  state: boolean;
  onClick?: MouseEventHandler;
}) {
  return (
    <label className="relative flex items-center justify-between p-4 text-lg group">
      <input
        type="checkbox"
        className="absolute w-full h-full -translate-x-1/2 rounded-md appearance-none left-1/2 peer"
        onClick={props.onClick}
        onChange={() => {}}
        checked={props.state}
      />
      <span
        id={props.text}
        className="w-24 
                    h-10 
                    flex 
                    items-center 
                    flex-shrink-0 
                    ml-4 
                    
                    text-black
                    text-center
                    after:leading-9
                    border-2
                    border-red-600
                    peer-checked:border-green-600
                    bg-gray-300 
                    rounded-full 
                    duration-300 
                    ease-in-out 
                    after:w-12 after:h-10
                    peer-checked:before:bg-red-600
                    peer-checked:after:bg-green-600
                    peer-checked:after:border-green-600
                    after:rounded-full 
                    after:shadow-md 
                    after:duration-300 
                    after:border-2
                    after:border-red-600
                    peer-checked:after:translate-x-12
                    group-hover:after:translate-x-1 
                    after:content-[attr(id)]
                    "
      ></span>
    </label>
  );
}
