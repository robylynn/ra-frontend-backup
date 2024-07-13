// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { ParameterDataTable } from "@/lib/reusable_components/client_components/parameter_data_table";

import { DashboardHeaderContainer } from "../../lib/reusable_components/client_components/dashboard_header_container";

export function MeasurementsContainer(props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
}) {
  const [expansionState, setExpansionState] = useState<boolean>(false);

  const text_size =
    expansionState || props.force_expanded ? "text-md" : "text-xs";

  return (
    <DashboardHeaderContainer
      header_text={"MEASUREMENTS"}
      icon_path={"/icons/sliders.svg"}
      className={`overflow-y-auto ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
      expansion_state={expansionState}
      set_expansion_state={setExpansionState}
    >
      <div className="flex flex-col h-full">
        <ParameterDataTable className={`${text_size}`} />
      </div>
    </DashboardHeaderContainer>
  );
}
