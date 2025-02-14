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
import {
  IOPointType,
  IOPointTypeFriendlyName,
  PlotConfiguration,
} from "@/lib/models/api_models";
import { IOPointContext } from "@/lib/components/client_components/IOPointContext";
import { PlotDataPoint, PlotInputData } from "@/lib/models/plotting_models";
import DataPlot from "@/lib/components/client_components/DataPlot";

type IOFetchDataInterface = Array<PlotDataPoint>;

const IOPlots = (props: {
  default_length: number;
  default_update_rate: number;
  point_type: IOPointType;
  // point_channels: Array<number>;
  plot_configuration: Array<PlotConfiguration>;
}) => {
  const { IOPoints } = useContext(IOPointContext);
  const { dashboardContext, setDashboardContext } =
    useContext(DashboardContext);
  const [completeIOData, setCompleteIOData] = useState<
    Record<number, Array<PlotDataPoint>>
  >({});

  const initialDataAcquired = useRef<Record<number, boolean>>();

  useEffect(() => {
    setCompleteIOData(() =>
      dashboardContext.configuration.io_plots[props.point_type].reduce(
        (data, plot_configuration, plot_index) => ({
          ...data,
          [plot_index]: [],
        }),
        {}
      )
    );

    initialDataAcquired.current = dashboardContext.configuration.io_plots[props.point_type].reduce(
      (data_acquired, plot_configuration, plot_index) => ({
        ...data_acquired,
        [plot_index]: false,
      }),
      {}
    );
  }, [dashboardContext.configuration.configured]);

  useEffect(() => {
    dashboardContext.configuration.io_plots[props.point_type].forEach(
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
  }, [dashboardContext.configuration.io_plots[props.point_type].length]);

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

              let data_point: PlotDataPoint = {
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
            dashboardContext.configuration.io_plots[props.point_type][plot_index].length
          ).then((data?) => {
            if (data.length) {
              setCompleteIOData((d) => ({ ...d, [plot_index]: data }));
              initialDataAcquired.current[plot_index] = true;
            } else {
              setCompleteIOData((d) => ({ ...d, [plot_index]: [] }));
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
    // plotContext.plot_lengths,
    JSON.stringify(dashboardContext.configuration.io_plots),
  ]);

  useEffect(() => {
    const latest_point = dashboardContext.getIOSState(props.point_type);
    if (latest_point) {
      let data_point: PlotDataPoint = {
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
              -dashboardContext.configuration.io_plots[props.point_type][plot_index]?.length
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
        plot_type: props.point_type,
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

  const parseIOData = (
    data: PlotDataPoint[]
    // data_key: string
  ): PlotInputData => {
    if (data && data.length > 0) {
      const data_arrays: PlotInputData = Object.keys(data?.[0]).map(
        (point_index) => {
          const numeric_point_index = parseInt(point_index);
          if (!isNaN(numeric_point_index)) {
            return {
              name: `Point ${numeric_point_index}`,
              id: numeric_point_index,
              data: data.map(
                (data_point) =>
                  ({
                    [numeric_point_index]: data_point[numeric_point_index],
                    time: data_point.time,
                  }) as PlotDataPoint
              ),
            };
          }
        }
      );

      return data_arrays;
    } else {
      return [];
    }
  };

  return dashboardContext.configuration.configured ? (
    <>
      {!Object.keys(completeIOData) ? (
        <p>WAITING FOR DATA</p>
      ) : (
        <div>
          <div key={"plots"}>
            {dashboardContext.configuration.io_plots[props.point_type].map(
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
                      `${IOPointTypeFriendlyName[props.point_type]} ${source}`;
                    const y_label =
                      point?.measurement_unit != ""
                        ? point.measurement_unit
                        : null;

                    labels[source] = { data_name: data_name, y_label: y_label };
                  }
                });

                return (
                  
                    <DataPlot
                      key={plot_index}
                      data_type={props.point_type}
                      // point_type_name={point_type_name}
                      data_sources={plot_configuration.data_sources.sort(
                        (a, b) => (a < b ? -1 : 1)
                      )}
                      data={completeIOData[plot_index]}
                      // data_parser={(data: PlotDataPoint[]) => data}
                      data_parser={(data) =>
                        data ? parseIOData(data as PlotDataPoint[]) : []
                      }
                      y_label={"y_label"}
                      plot_index={plot_index}
                      initial_data_acquired={
                        initialDataAcquired.current?.[plot_index]
                      }
                      available_sources={configured_IO_points.filter(
                        (point) =>
                          !dashboardContext.configuration.io_plots[props.point_type][
                            plot_index
                          ].data_sources.includes(point.channel)
                      )}
                      selected_sources={configured_IO_points
                        .filter((point) =>
                          dashboardContext.configuration.io_plots[props.point_type][
                            plot_index
                          ].data_sources.includes(point.channel)
                        )
                        .sort((a, b) => (a.channel < b.channel ? -1 : 1))}
                      base_plot_length={100}
                      selected_update_rate={
                        dashboardContext.configuration.io_plots[props.point_type][plot_index]
                          .update_rate
                      }
                      selected_plot_length={
                        dashboardContext.configuration.io_plots[props.point_type][plot_index].length
                      }
                      delete_plot_callback={(plot_index: number) =>
                        setDashboardContext({
                          payload: {
                            plot_type: props.point_type,
                            plot_index: plot_index,
                          },
                          type: "plots/delete",
                        })
                      }
                      add_trace_callback={(io_channel: number) => {
                        setDashboardContext({
                          payload: {
                            plot_type: props.point_type,
                            plot_index: plot_index,
                            data_sources: [
                              ...dashboardContext.configuration.io_plots[props.point_type][
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
                            plot_type: props.point_type,
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
                            plot_type: props.point_type,
                            plot_index: plot_index,
                            length: length,
                          },
                          type: "plots/update",
                        });
                      }}
                    />
                  
                );
              }
            )}
          </div>
        </div>
      )}
      <div className = "flex flex-col items-center justify-center p-2">
        <R2Button
          // text={`New ${point_type_name(props.point_type)} Plot`}
          text={`New ${IOPointTypeFriendlyName[props.point_type]} Plot`}
          className="w-[95%]"
          onClick={() => {
            handleAddPlot();
          }}
        />
        </div>
    </>
  ) : (
    <LoadingIndicator />
  );
};

const IOPlotContainer = (props: { point_type: IOPointType }) => {
  const { dashboardContext } = useContext(DashboardContext);

  return (
      <IOPlots
        default_length={100}
        default_update_rate={5}
        point_type={props.point_type}
        plot_configuration={
          [...dashboardContext.configuration.io_plots[props.point_type]] ?? undefined
        }
      />
  );
};

export default IOPlotContainer;
