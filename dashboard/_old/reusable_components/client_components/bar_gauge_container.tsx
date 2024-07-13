// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { ReactElement, useContext } from "react";

import DashboardContext from "@/lib/models/dashboard_context";

import { SVGGauge } from "./bar_gauge";
import { PagePanel } from "./dashboard_header_container";
import LoadingIndicator from "../server_components/loading_indicator";

export default function BarGaugeContainer(props: {
  gauge_bar_height_px: number;
  className?: string;
}) {
  const { context } = useContext(DashboardContext);

  if (
    context.configuration.configured &&
    context.latest_document.document_valid
  ) {
    const gauge_array = (): Array<ReactElement> => {
      const gauge_array = [];
      for (const gauge_id in context.configuration.gauges) {
        const gauge_configuration = context.configuration.gauges[gauge_id];
        const gauge_value = context.latest_document.GetComponentParameterState(
          gauge_configuration.data_component_name,
          gauge_configuration.data_parameter_name,
        );

        gauge_array.push(
          <SVGGauge
            key={gauge_configuration.gauge_id}
            id={gauge_configuration.gauge_id}
            title={gauge_configuration.gauge_text}
            height={props.gauge_bar_height_px}
            maximum={gauge_configuration.gauge_maximum}
            minimum={gauge_configuration.gauge_minimum}
            warning_threshold={gauge_configuration.gauge_warning_threshold}
            danger_threshold={gauge_configuration.gauge_danger_threshold}
            gauge_colors_reversed={gauge_configuration.gauge_colors_reversed}
            value={gauge_value as number}
          />,
        );
      }
      return gauge_array;
    };

    return (
      <PagePanel
        className={`
            grid
            grid-cols-2 
            grid-rows-2
            justify-items-center 
            px-2 
            rounded-xl
            h-fit
            grow-0
            py-0
            ${props.className ?? ""}`}
      >
        {gauge_array()}
      </PagePanel>
    );
  } else {
    return (
      <PagePanel
        className={`
            flex
            flex-row
            justify-items-center 
            justify-around
            px-2 
            rounded-xl
            h-fit
            grow-0
            py-0
            ${props.className ?? ""}`}
      >
        <LoadingIndicator />
      </PagePanel>
    );
  }
}
