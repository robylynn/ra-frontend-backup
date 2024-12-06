"use client";

import {
  useContext,
  ReactElement,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import MotionPlot from "@/lib/components/client_components/MotionPlot";
import { DashboardContext } from "@/lib/components/client_components/DashboardContextWrapper";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";
import { AxisData } from "@/lib/models/ros_models";
import {
  PlotContext,
  PlotContextProvider,
} from "@/lib/components/client_components/PlotContext";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import { AxisTimeDataInterface } from "@/lib/models/plotting_models";
import { ROSAxisStateInterface } from "@/lib/models/database_models";
import { DatabaseROSAxisStateArray } from "@/lib/models/database_models";
import { PlotTimeData, PlotAxisData } from "@/lib/models/plotting_models";

interface InitialFetchDataInterface {
  time_data: PlotTimeData | null;
  axis_data: Array<AxisData> | null;
}

interface DataBufferInterface {
  time: PlotTimeData;
  data: PlotAxisData;
}

function MotionPlots(props: {
  available_axes: Array<number>;
  plot_types: Array<string>;
  default_update_rate: number;
  default_length: number;
}): ReactElement {
  const { dashboardContext } = useContext(DashboardContext);
  const { plotContext: motionPlotContext, setPlotContext: setMotionPlotContext } =
    useContext(PlotContext);

  const initialCompleteTimeData = props.plot_types.reduce(
    (o, key) => ({ ...o, [key]: {} }),
    {}
  );
  const [completeTimeData, setCompleteTimeData] = useState<
    Record<string, Record<number, Array<AxisTimeDataInterface>>>
  >(initialCompleteTimeData);

  const initialCompleteAxisData = props.plot_types.reduce(
    (o, key) => ({ ...o, [key]: {} }),
    {}
  );
  const [completeAxisData, setCompleteAxisData] = useState<
    Record<string, PlotAxisData>
  >(initialCompleteAxisData);

  const initialDataInitializer = props.plot_types.reduce(
    (initialDataObj, plot_type) => ({
      ...initialDataObj,
      [plot_type]: props.available_axes.reduce(
        (axes, axis_index) => ({ ...axes, [axis_index]: false }),
        {}
      ),
    }),
    {}
  );

  const initial_data_acquired = useRef<Record<string, Record<number, boolean>>>(
    initialDataInitializer
  );

  const [plotUpdateCounters, setPlotUpdateCounters] = useState<
    Record<string, number>
  >(
    props.plot_types.reduce(
      (counters, plot_type) => ({ ...counters, [plot_type]: 0 }),
      {}
    )
  );

  Object.keys(plotUpdateCounters).forEach((plot_key) =>
    useEffect(() => {
      const intervalId = setInterval(
        () => {
          console.log(
            `Update rate for ${plot_key} is ${motionPlotContext.update_rates[plot_key]}`
          );

          setPlotUpdateCounters((counters) => ({
            ...counters,
            [plot_key]: counters[plot_key] + 1,
          }));
        },
        motionPlotContext.update_rates[plot_key] > 0
          ? motionPlotContext.update_rates[plot_key] * 1000
          : 1000
      );
      return () => clearInterval(intervalId);
    }, [motionPlotContext.update_rates[plot_key]])
  );

  const areAllAxesAcquiredForPlot = (plot_key: string): boolean =>
    Object.keys(initial_data_acquired.current?.[plot_key])
      .map((axis_key) => initial_data_acquired.current[plot_key][axis_key])
      .every((b) => b);

  const plotDataBuffers: Record<string, DataBufferInterface> =
    props.plot_types.reduce(
      (o, plot_key) => ({
        ...o,
        [plot_key]: useMemo((): DataBufferInterface => {
          const axes_data: PlotAxisData = {};
          Object.keys(completeAxisData[plot_key]).forEach((axis_index) => {
            axes_data[axis_index] = completeAxisData[plot_key]?.[axis_index]
              .slice(-motionPlotContext.plot_lengths[plot_key])
              .filter((_, index) => index % 1 === 0);
          });

          if (areAllAxesAcquiredForPlot(plot_key)) {
            return {
              time: completeTimeData?.[plot_key]?.[0]
                ?.slice(-motionPlotContext.plot_lengths[plot_key])
                .filter((_, index) => index % 1 === 0),
              data: axes_data,
            };
          } else {
            return {
              time: [],
              data: initialDataInitializer,
            };
          }
        }, [
          Object.keys(initial_data_acquired.current?.[plot_key])
            .map(
              (axis_key) => initial_data_acquired.current[plot_key][axis_key]
            )
            .every((b) => b),
          motionPlotContext.plot_lengths[plot_key],
          plotUpdateCounters[plot_key],
        ]),
      }),
      {}
    );

  useEffect(() => {
    setMotionPlotContext((c) => ({
      ...c,
      plot_lengths: props.plot_types.reduce(
        (lengths, plot_type) => ({
          ...lengths,
          [plot_type]: props.default_length,
        }),
        {}
      ),
      update_rates: props.plot_types.reduce(
        (rates, plot_type) => ({
          ...rates,
          [plot_type]: props.default_update_rate,
        }),
        {}
      ),
    }));
  }, []);

  useEffect(() => {
    const get_initial_data = async (
      axis_index: number,
      length: number
    ): Promise<InitialFetchDataInterface> => {
      let ret: Promise<InitialFetchDataInterface> =
        new Promise<InitialFetchDataInterface>((resolve, reject) =>
          resolve({ time_data: null, axis_data: null })
        );

      await timeoutFetch<Array<ROSAxisStateInterface>>(
        `/api/backend/historian/axis/${axis_index}?number_of_points=${length}`,
        5000
      )
        .then((data?) => {
          if (data) {
            let data_documents = new DatabaseROSAxisStateArray(data);
            console.log("Got initial data");

            const time_data = data_documents.documents
              .map((d) => ({
                time: d.stamp.sec + d.stamp.nanosec / 1e9,
              }))
              .reverse();

            const axis_data = data_documents.documents
              .map((d) => ({
                stamp: d.stamp,
                axis_index: axis_index,
                position: d.position,
                velocity: d.velocity,
              }))
              .reverse();

            initial_data_acquired.current = {
              ...initial_data_acquired.current,
              [axis_index]: true,
            };

            ret = new Promise<InitialFetchDataInterface>((resolve, reject) =>
              resolve({ time_data: time_data, axis_data: axis_data })
            );
          }
        })
        .catch((e) => {
          console.error(
            `Error acquiring initial plot data of length ${length} for axis index ${axis_index}: ${e}`
          );

          initial_data_acquired.current = {
            ...initial_data_acquired.current,
            [axis_index]: false,
          };
        });

      return ret;
    };

    const fill_initial_data = async () => {
      Object.keys(motionPlotContext.plot_lengths).forEach(
        (plot_key, plot_index) => {
          const plot_length = motionPlotContext.plot_lengths[plot_key];
          props.available_axes.forEach((axis_index) => {
            if (!initial_data_acquired.current?.[plot_key][axis_index]) {
              get_initial_data(axis_index, plot_length).then(
                ({ time_data, axis_data }) => {
                  if (time_data && axis_data) {
                    initial_data_acquired.current = {
                      ...initial_data_acquired.current,
                      [plot_key]: {
                        ...initial_data_acquired.current[plot_key],
                        [axis_index]: true,
                      },
                    };

                    setCompleteTimeData((d) => ({
                      ...d,
                      [plot_key]: { ...d[plot_key], [axis_index]: time_data },
                    }));

                    setCompleteAxisData((d) => ({
                      ...d,
                      [plot_key]: { ...d[plot_key], [axis_index]: axis_data },
                    }));
                  }
                }
              );
            }
          });
        }
      );
    };

    fill_initial_data();
  }, [motionPlotContext.plot_lengths, dashboardContext.heartbeat_counter]);

  useEffect(() => {
    props.plot_types.forEach((plot_key) => {
      props.available_axes.forEach((axis_index) => {
        if (initial_data_acquired.current[plot_key][axis_index]) {
          const last_time =
            completeTimeData[plot_key][axis_index]?.slice(-1)[0]?.time;
          const new_time =
            dashboardContext.axis_data[axis_index]?.stamp.sec +
            dashboardContext.axis_data[axis_index]?.stamp.nanosec / 1e9;

          // Only start building the array if the initial fetch is complete
          if (new_time) {
            // If this update has a time entry for the selected axis
            if (new_time != last_time) {
              // This is a new data point
              const time_data_point: AxisTimeDataInterface = { time: new_time };
              const axis_data_point = dashboardContext.axis_data[axis_index];

              setCompleteTimeData((d) => ({
                ...d,
                [plot_key]: {
                  ...d[plot_key],
                  [axis_index]: [...d[plot_key]?.[axis_index], time_data_point].slice(-motionPlotContext.plot_lengths[plot_key]),
                },
              }));

              setCompleteAxisData((d) => ({
                ...d,
                [plot_key]: {
                  ...d[plot_key],
                  [axis_index]: [...d[plot_key]?.[axis_index], axis_data_point].slice(-motionPlotContext.plot_lengths[plot_key]),
                },
              }));
            }
          }
        }
      });
    });
  }, [dashboardContext.axis_data]);

  return dashboardContext.configuration?.configured ? (
    <>
      {Object.keys(plotDataBuffers).map((plot_key, _) => (
        <MotionPlot
          key={plot_key}
          plot_key={plot_key}
          axes={[0, 1, 2, 3]}
          time_data={plotDataBuffers[plot_key].time}
          plot_data={plotDataBuffers[plot_key].data}
          title={plot_key}
          data_key={plot_key}
          unit="unit"
          base_length={100}
          selected_length={motionPlotContext.plot_lengths[plot_key]}
          selected_update_rate={motionPlotContext.update_rates[plot_key]}
          y_axis_transformation={(y) => y}
          plot_length_setter={(plot_key, length) => {
            Object.keys(initial_data_acquired.current[plot_key]).forEach(
              (axis_index) => {
                initial_data_acquired.current[plot_key][axis_index] = false;
              }
            );

            setMotionPlotContext((c) => ({
              ...c,
              plot_lengths: {
                ...c.plot_lengths,
                [plot_key]: length,
              },
            }));
          }}
          plot_update_rate_setter={(plot_key, update_rate) => {
            setMotionPlotContext((c) => ({
              ...c,
              update_rates: {
                ...motionPlotContext.update_rates,
                [plot_key]: update_rate,
              },
            }));
          }}
        />
      ))}
    </>
  ) : (
    <LoadingIndicator />
  );
}

export function MotionPlotContainer(): ReactElement {
  const { dashboardContext } = useContext(DashboardContext);

  return dashboardContext.configuration?.configured ? (
    <>
      <PlotContextProvider>
        <MotionPlots
          available_axes={[0, 1, 2, 3]}
          plot_types={["velocity", "position"]}
          default_update_rate={5}
          default_length={100}
        />
      </PlotContextProvider>
    </>
  ) : (
    <LoadingIndicator />
  );
}
