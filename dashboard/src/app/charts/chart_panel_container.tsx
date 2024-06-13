// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { DashboardHeaderContainer } from "@/lib/reusable_components/client_components/dashboard_header_container";
import ChartContainer from "@/lib/reusable_components/server_components/chart_container";
import LoadingIndicator from "@/lib/reusable_components/server_components/loading_indicator";
import { NextAPIResponseInterface } from "@/lib/reusable_models/api_models";
import DashboardContext from "@/lib/reusable_models/dashboard_context";
import { DatabaseDocumentArray } from "@/lib/reusable_models/database_models";
import {
  ChartDataTrace,
  ChartStates,
  MultitraceChartDataset,
} from "@/lib/reusable_models/visualization_models";

export function ChartPanelContainer(props: {
  id: string;
  className?: string;
  update_period_seconds: number;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
}) {
  // const { context, setContext } = useContext(DashboardContext);
  const { context } = useContext(DashboardContext);
  const [chartStates, setChartStates] = useState<ChartStates>();
  const [updateCounter, setUpdateCounter] = useState<number>(0);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setUpdateCounter((c) => c + 1);
    }, props.update_period_seconds * 1000);
    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    const chart_state_update: ChartStates = {
      charts: {},
      full_dataset: new DatabaseDocumentArray(),
    };

    if (
      chartStates == undefined ||
      Object.keys(chartStates.charts).length == 0
    ) {
      if (context.configuration == undefined) {
        // nothing we can do, return
        console.log("No chart configuration, cannot update data");
      } else {
        Object.keys(context.configuration.charts).forEach((chart_name) => {
          const traces =
            context.configuration.charts[chart_name].trace_configuration;
          const chart_data_traces: Record<string, ChartDataTrace> = {};
          traces.forEach((trace) => {
            chart_data_traces[trace.y_component_name] = new ChartDataTrace(
              "red",
              `${trace.y_component_name}_${trace.y_parameter_name}`,
              [],
            );
          });
          chart_state_update.charts[chart_name] = {
            number_of_points_shown: 100,
            chart_data: new MultitraceChartDataset(
              context.configuration.charts[chart_name].x_axis_label,
              [],
              chart_data_traces,
            ),
          };
        });

        setChartStates(() => {
          return chart_state_update;
        });
      }
    } else {
      let maximum_sample_length = 0;

      for (const chart_name of Object.keys(chartStates?.charts)) {
        if (Object.hasOwn(chartStates.charts, chart_name)) {
          const state = chartStates?.charts[chart_name];
          if (state.number_of_points_shown > maximum_sample_length)
            maximum_sample_length = state.number_of_points_shown;
        }
      }

      const fetchData = async () => {
        const response: NextAPIResponseInterface = await fetch(
          `/api/stream/data/${maximum_sample_length}`,
        ).then((res) => res.json());

        if (response.authenticated) {
          const documents: DatabaseDocumentArray = new DatabaseDocumentArray(
            response.data,
          );

          if (documents.documents.length > 0) {
            setChartStates((chart_states) => {
              return {
                ...(chart_states as ChartStates),
                // ...(chart_states as any),
                full_dataset: documents,
              };
            });
          }
        }
      };

      fetchData();
    }
  }, [updateCounter]);

  const charts = (): Array<ReactElement> => {
    const chart_array: Array<ReactElement> = [];
    if (chartStates != undefined) {
      for (const chart_name of Object.keys(chartStates.charts)) {
        const chart_configuration = context.configuration.charts[chart_name];
        const point_count =
          chartStates.charts[chart_name].number_of_points_shown;

        const traces: Record<string, ChartDataTrace> = {};
        let dataset_x_values: Array<number> = [];
        for (const trace of chart_configuration.trace_configuration) {
          // const trace_name = `${trace.y_component_name}_${trace.y_parameter_name}`;
          const { y_values, x_values } =
            chartStates.full_dataset.get_data_points(
              trace.y_component_name,
              trace.y_parameter_name,
              point_count,
              true,
            );
          traces[`${trace.y_component_name}_${trace.y_parameter_name}`] =
            new ChartDataTrace(trace.color, trace.label, y_values);
          dataset_x_values = x_values;
        }

        const chart_dataset = new MultitraceChartDataset(
          chart_configuration.x_axis_label,
          dataset_x_values,
          traces,
        );

        chart_array.push(
          <ChartContainer
            key={chart_configuration.chart_id}
            configuration={chart_configuration}
            chart_data={chart_dataset}
            className="w-full h-full py-2 text-xs"
          />,
        );
      }
    }

    return chart_array;
  };

  return (
    <DashboardHeaderContainer
      header_text="DATA CHARTS"
      icon_path={"/icons/Control.svg"}
      className={`snap-y snap-start ${props.className ?? ""}`}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      {context.latest_document.document_valid ? charts() : <LoadingIndicator />}
    </DashboardHeaderContainer>
  );
}
