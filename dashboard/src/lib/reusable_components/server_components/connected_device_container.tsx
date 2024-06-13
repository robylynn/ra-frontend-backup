// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import Link from "next/link";
import { ReactNode } from "react";
import { R2Button } from "../client_components/click_button";

export function ConnectedDeviceContainer(props: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col h-full m-2 rounded-xl bg-r2-dark-background-500">
        <p className="w-full p-2 dark:text-r2-white">{props.title}</p>
        <div className="flex flex-col justify-around h-full">
          {props.children}
        </div>
        <Link
        className={`
        grid 
        grid-cols-[30%_70%] 
        text-black 
        hover:bg-slate-400 
        hover:text-white 
        hover:no-underline 
        focus:border-0
        p-2 
        content-center 
        items-center 
        rounded-xl 
        justify-around 
        text-sm
        w-[90%]
        `}
          href={"devices/1"}
        >
          <p>Open</p>
        </Link>
        {/* <R2Button
          text="Open"
          onClick={() => {}}
        /> */}
      </div>
    </div>
  );
}
