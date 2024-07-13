// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { ReactNode } from "react";

export function ControlsSubContainer(props: {
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
      </div>
    </div>
  );
}
