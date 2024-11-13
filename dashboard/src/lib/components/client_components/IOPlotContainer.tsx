// Frontend Web Application for RA Products
// Developed by R2 Labs

"use client";

import React, { useContext, useState, useRef, useEffect } from "react";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import {
  ROSIOStateInterface,
  DatabaseROSIOStateArray,
} from "@/lib/models/database_models";
import { R2Button } from "@/lib/components/client_components/ClickButton";
import { IOPointType, PlotConfiguration } from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import { IODataPoint } from "@/lib/models/plotting_models";
import { PlotContext, PlotContextProvider } from "./PlotContext";
import IOPlot from "@/lib/components/client_components/IOPlot";

type IOFetchDataInterface = Array<IODataPoint>;

const IOPlots = (props: {
  default_length: number;
  default_update_rate: number;
  point_type: IOPointType;
  point_channels: Array<number>;
  plot_configuration: Array<PlotConfiguration>;
}) => {
  // const { inputs } = useContext(AnalogInputContext);
  const { IOPoints } = useContext(IOPointContext);
  const { dashboardContext, setDashboardContext } =
    useContext(DashboardContext);
  const { plotContext, setPlotContext } = useContext(PlotContext);
  // const [selectedPlot, setSelectedPlot] = useState<string>();
  // const [selectedTraces, setSelectedTraces] = useState<Record<number, number>>(
  //   {}
  // );
  const [completeIOData, setCompleteIOData] = useState<
    Record<number, Array<IODataPoint>>
  >({});

  const initialDataAcquired = useRef<Record<number, boolean>>();
  //   let plotDataBuffers: Record<number, Array<IODataPoint>> = {};

  useEffect(() => {
    setPlotContext((p) => ({
      ...p,
      plot_lengths: props.point_channels.reduce(
        (lengths, io_channel) => ({
          ...lengths,
          [io_channel]: props.default_length,
        }),
        {}
      ),
      update_rates: props.point_channels.reduce(
        (rates, plot_type) => ({
          ...rates,
          [plot_type]: props.default_update_rate,
        }),
        {}
      ),
    }));

    setCompleteIOData(() =>
      dashboardContext.configuration.plots.reduce(
        (data, plot_configuration, plot_index) => ({
          ...data,
          [plot_index]: [],
        }),
        {}
      )
    );

    initialDataAcquired.current = dashboardContext.configuration.plots.reduce(
      (data_acquired, plot_configuration, plot_index) => ({
        ...data_acquired,
        [plot_index]: false,
      }),
      {}
    );
  }, [dashboardContext.configuration.configured]);

  useEffect(() => {
    dashboardContext.configuration.plots.forEach(
      (plot_configuration, plot_index) => {
        if (!Object.keys(completeIOData).includes(plot_index.toString())) {
          setCompleteIOData((d) => ({
            ...d,
            [plot_index]: [],
          }));
        }

        if (
          !Object.keys(initialDataAcquired.current).includes(
            plot_index.toString()
          )
        ) {
          initialDataAcquired.current[plot_index] = false;
        }
      }
    );
  }, [dashboardContext.configuration.plots.length]);

  const data_endpoint = (point_type: IOPointType): string => {
    switch (point_type) {
      case IOPointType.DIGITAL_INPUT: {
        return "digital_in";
      }
      case IOPointType.ANALOG_INPUT: {
        return "analog_in";
      }
    }
  };

  useEffect(() => {
    const get_initial_data = async (
      length: number
    ): Promise<IOFetchDataInterface> => {
      let initial_data = new Promise<IOFetchDataInterface>((resolve, reject) =>
        resolve([])
      );

      await timeoutFetch<Array<ROSIOStateInterface>>(
        `/api/backend/historian/${data_endpoint(props.point_type)}?number_of_points=${length}`,
        5000
      )
        .then((data?) => {
          if (data) {
            let data_documents = new DatabaseROSIOStateArray(data);
            console.log("Got initial data");
            // setCompleteIOData((prevData) => {
            const initial_chart_data = data_documents.documents.map((d) => {
              // let time = d.time_sec + d.time_nsec / 1e9;

              // if (props.point_type == IOPointType.DIGITAL_INPUT) {
              //   let a = 5;
              // }

              let time = d.stamp.sec + d.stamp.nanosec / 1e9;

              let data_point: IODataPoint = {
                time: time,
              };

              for (const key in d.values) {
                if (
                  props.point_type == IOPointType.ANALOG_INPUT ||
                  props.point_type == IOPointType.ANALOG_OUTPUT
                )
                  data_point[parseInt(key)] = d.values[key];
                else data_point[parseInt(key)] = d.values[key] ? 1 : 0;
              }

              return data_point;
            });
            //   initial_data_acquired.current = true;
            //   initial_chart_data.reverse();
            // });

            initial_data = new Promise<IOFetchDataInterface>(
              (resolve, reject) => resolve(initial_chart_data.reverse())
            );
          }
        })
        .catch((e) => {
          console.error(`Error acquiring initial plot data: ${e}`);
          //   initial_data_acquired.current = false;
        });

      return initial_data;
    };

    const fill_initial_data = async () => {
      Object.keys(initialDataAcquired.current).forEach((plot_index) => {
        // return
        if (
          !initialDataAcquired.current[plot_index] &&
          dashboardContext.configuration.configured
        ) {
          get_initial_data(
            dashboardContext.configuration.plots[plot_index].length
          ).then((data?) => {
            if (data.length) {
              setCompleteIOData((d) => ({ ...d, [plot_index]: data }));
              initialDataAcquired.current[plot_index] = true;
            }
          });
        }
      });
    };

    // if (!initial_data_acquired.current) get_initial_data();
    fill_initial_data();
  }, [
    dashboardContext.heartbeat_counter,
    plotContext.plot_lengths,
    dashboardContext.configuration.plots,
  ]);

  useEffect(() => {
    const latest_point = dashboardContext.getIOSState(props.point_type);
    if (latest_point) {
      let data_point: IODataPoint = {
        time: latest_point.stamp.sec + latest_point.stamp.nanosec / 1e9,
      };

      latest_point.values.forEach((v, i) => {
        if (
          props.point_type == IOPointType.ANALOG_INPUT ||
          props.point_type == IOPointType.ANALOG_OUTPUT
        )
          data_point[i] = v;
        else data_point[i] = v ? 1 : 0;
      });

      Object.keys(initialDataAcquired.current).forEach((plot_index) => {
        if (initialDataAcquired.current[plot_index]) {
          setCompleteIOData((data) => ({
            ...data,
            [plot_index]: [...data[plot_index], data_point].slice(
              -dashboardContext.configuration.plots[plot_index]?.length
            ),
          }));
        }
      });
    }
  }, [dashboardContext.getIOSState(props.point_type)]);

  const configured_IO_points = IOPoints.getConfiguredIOPoints(props.point_type);

  const handleAddPlot = () => {
    setDashboardContext({
      payload: {
        configuration: new PlotConfiguration({
          enabled: true,
          length: props.default_length,
          data_sources: [],
          update_rate: 5,
        }),
      },
      type: "plots/add",
    });
  };

  const point_type_name = (point_type: IOPointType) => {
    switch (point_type) {
      case IOPointType.ANALOG_INPUT: {
        return "Analog Input";
      }
      case IOPointType.DIGITAL_INPUT: {
        return "Digital Input";
      }
      default: {
        return "Unknown Type";
      }
    }
  };

  return dashboardContext.configuration.configured ? (
    <>
      {!Object.keys(completeIOData) ? (
        <p>WAITING FOR DATA</p>
      ) : (
        <div>
          <div key={"plots"}>
            {dashboardContext.configuration.plots.map(
              (plot_configuration, plot_index) => {
                let labels: Record<
                  number,
                  { data_name: string; y_label: string }
                > = {};

                plot_configuration.data_sources.forEach((source) => {
                  const point = IOPoints.getIOPoints(props.point_type)?.[
                    source
                  ];

                  if (point) {
                    const point_label = point?.label;
                    const data_name =
                      point_label ??
                      `${point_type_name(props.point_type)} ${source}`;
                    const y_label =
                      point?.measurement_unit != ""
                        ? point.measurement_unit
                        : null;

                    labels[source] = { data_name: data_name, y_label: y_label };
                  }
                });

                return (
                  <>
                    <IOPlot
                      key={plot_index.toString()}
                      point_type={props.point_type}
                      // point_type_name={point_type_name}
                      data_sources={plot_configuration.data_sources.sort(
                        (a, b) => (a < b ? -1 : 1)
                      )}
                      data={completeIOData[plot_index]}
                      y_label={"y_label"}
                      plot_index={plot_index}
                      initial_data_acquired={
                        initialDataAcquired.current?.[plot_index]
                      }
                      available_io_channels={configured_IO_points.filter(
                        (point) =>
                          !dashboardContext.configuration.plots[
                            plot_index
                          ].data_sources.includes(point.channel)
                      )}
                      selected_io_channels={configured_IO_points
                        .filter((point) =>
                          dashboardContext.configuration.plots[
                            plot_index
                          ].data_sources.includes(point.channel)
                        )
                        .sort((a, b) => (a.channel < b.channel ? -1 : 1))}
                      base_plot_length={100}
                      selected_update_rate={
                        dashboardContext.configuration.plots[plot_index]
                          .update_rate
                      }
                      selected_plot_length={
                        dashboardContext.configuration.plots[plot_index].length
                      }
                      delete_plot_callback={(plot_index: number) =>
                        setDashboardContext({
                          payload: {
                            plot_index: plot_index,
                          },
                          type: "plots/delete",
                        })
                      }
                      add_trace_callback={(io_channel: number) => {
                        setDashboardContext({
                          payload: {
                            plot_index: plot_index,
                            data_sources: [
                              ...dashboardContext.configuration.plots[
                                plot_index
                              ].data_sources,
                              io_channel,
                            ],
                          },
                          type: "plots/update",
                        });
                      }}
                      change_update_rate_callback={(update_rate: number) => {
                        setDashboardContext({
                          payload: {
                            plot_index: plot_index,
                            update_rate: update_rate,
                          },
                          type: "plots/update",
                        });
                      }}
                      change_plot_length_callback={(length: number) => {
                        initialDataAcquired.current = {
                          ...initialDataAcquired.current,
                          [plot_index]: false,
                        };
                        setDashboardContext({
                          payload: {
                            plot_index: plot_index,
                            length: length,
                          },
                          type: "plots/update",
                        });
                      }}
                    />
                  </>
                );
              }
            )}
          </div>
        </div>
      )}
      <R2Button
        text={`New ${point_type_name(props.point_type)} Plot`}
        className="w-[100%]"
        onClick={() => {
          handleAddPlot();
        }}
      />
    </>
  ) : (
    <LoadingIndicator />
  );
};

const IOPlotContainer = (props: { point_type: IOPointType }) => {
  const { dashboardContext } = useContext(DashboardContext);

  return (
    <PlotContextProvider>
      <IOPlots
        default_length={100}
        default_update_rate={5}
        point_type={props.point_type}
        point_channels={[0, 1, 2, 3]}
        plot_configuration={
          [...dashboardContext.configuration.plots] ?? undefined
        }
      />
    </PlotContextProvider>
  );
};

export default IOPlotContainer;
