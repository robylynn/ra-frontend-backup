// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { ReactElement, useContext } from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";

import { DashboardHeaderContainer } from "@/lib/reusable_components/client_components/dashboard_header_container";
import IOModuleControl from "@/lib/reusable_components/server_components/io_module_control";
import LoadingIndicator from "@/lib/reusable_components/server_components/loading_indicator";
import DashboardContext from "@/lib/reusable_models/dashboard_context";

export default function DiagnosticsContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const { context } = useContext(DashboardContext);

  const build_module_list = () => {
    if (!context.configuration.configured || !context.io_state.state_valid)
      return <></>;

    const modules: Array<ReactElement> | undefined =
      context.configuration.io_modules?.io_modules.map((module) => {
        return (
          <IOModuleControl
            key={`${module.module_name}_${module.module_index}`}
            module={module}
            module_state={context.io_state.latest_document.get_module_state(
              module.module_index,
            )}
          />
        );
      });

    return modules ?? <></>;
  };

  return (
    <DashboardHeaderContainer
      header_text={"DIAGNOSTICS"}
      icon_path={"/icons/sliders.svg"}
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
    >
      {context.configuration.configured ? (
        <div className={`grid grid-cols-3 p-2 ${props.className ?? ""}`}>
          {build_module_list()}
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </DashboardHeaderContainer>
  );
}
