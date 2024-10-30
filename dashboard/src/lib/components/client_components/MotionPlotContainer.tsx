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
import SimpleMotionPlot from "./SimpleMotionPlot";
import { AxisData } from "@/lib/models/ros_models";
import {
  MotionPlotContext,
  MotionPlotContextProvider,
} from "@/lib/components/client_components/MotionPlotContext";
import timeoutFetch from "@/lib/utils/timeoutFetch";
import { AxisTimeDataInterface } from "@/lib/models/plotting_models";
import {
  DatabaseDocument,
  ROSAxisStateInterface,
} from "@/lib/models/database_models";
import { DatabaseROSAxisStateArray } from "@/lib/models/database_models";

type PlotTimeData = Array<AxisTimeDataInterface>;
type PlotAxisData = Record<number, Array<AxisData>>;

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
}): ReactElement {
  const { dashboardContext } = useContext(DashboardContext);
  const { motionPlotContext, setMotionPlotContext } =
    useContext(MotionPlotContext);

  const [timeData, setTimeData] = useState<Array<AxisTimeDataInterface>>([]);
  const [axisData, setAxisData] = useState<Record<number, Array<AxisData>>>({});

  const initialCompleteTimeData = props.plot_types.reduce(
    (o, key) => ({ ...o, [key]: {} }),
    {}
  );
  const [completeTimeData, setCompleteTimeData] = useState<
    Record<string, Record<number, Array<AxisTimeDataInterface>>>
  >(initialCompleteTimeData);
  //   >({
  //   velocity: [],
  //   position: [],
  // });

  // const [completeAxisData, setCompleteAxisData] = useState<
  //   Record<"velocity" | "position", Record<number, Array<AxisData>>>
  // >({
  //   velocity: {},
  //   position: {},
  // });

  const initialCompleteAxisData = props.plot_types.reduce(
    (o, key) => ({ ...o, [key]: {} }),
    {}
  );
  const [completeAxisData, setCompleteAxisData] = useState<
    Record<string, PlotAxisData>
  >(initialCompleteAxisData);

  // const initial_data_acquired = useRef<
  //   Record<"velocity" | "position", Record<number, boolean>>
  // >({
  //   velocity: {},
  //   position: {},
  // });

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

  // const [plotLengths, setPlotLengths] = useState<Record<number, number>>({});
  const positionPlotData = useMemo(
    () => completeAxisData["position"],
    [motionPlotContext.plot_lengths?.["position"]]
  );

  const velocityPlotData = useMemo(
    () => completeAxisData["velocity"],
    [motionPlotContext.plot_lengths?.["velocity"]]
  );

  // const plotDataBuffers = ["velocity", "position"].map((plot_key) =>
  //   useMemo(
  //     () => completeAxisData[plot_key],
  //     [motionPlotContext.plot_lengths?.[plot_key]]
  //   )
  // );
  // const plotDataBuffers: Record<string, DataBufferInterface> = {};
  const [updateCounter, setUpdateCounter] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setUpdateCounter((counter) => counter + 1);
    }, 5 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const plotDataBuffers: Record<string, DataBufferInterface> =
    props.plot_types.reduce(
      (o, plot_key) => ({
        ...o,
        [plot_key]: useMemo(
          (): DataBufferInterface => ({
            time: completeTimeData?.[plot_key]?.[0],
            data: completeAxisData[plot_key],
          }),
          // [motionPlotContext.plot_lengths?.[plot_key]]
          [
            Object.keys(initial_data_acquired.current?.[plot_key]).map((axis_key) => initial_data_acquired.current[plot_key][axis_key]).every((b) => b)
          ]
        ),
      }),
      {}
    );

  useEffect(() => {
    setMotionPlotContext((c) => ({
      ...c,
      plot_lengths: props.plot_types.reduce(
        (lengths, plot_type) => ({ ...lengths, [plot_type]: 100 }),
        {}
      ),
    }));
  }, []);

  // props.plot_types.forEach(
  //   (plot_key) =>
  //     (plotDataBuffers[plot_key] = useMemo(
  //       (): DataBufferInterface => ({
  //         time: completeTimeData?.[plot_key]?.[0],
  //         data: completeAxisData[plot_key],
  //       }),
  //       // [motionPlotContext.plot_lengths?.[plot_key]]
  //       []
  //     ))
  // );

  // const plotDataBuffers = ["velocity", "position"].map((plot_key) =>
  //   useMemo(
  //     () : DataBufferInterface => ({time: completeTimeData[plot_key], data: completeAxisData[plot_key]}),
  //     [motionPlotContext.plot_lengths?.[plot_key]]
  //   )
  // );

  useEffect(() => {
    const get_initial_data = async (
      axis_index: number,
      length: number
    ): Promise<InitialFetchDataInterface> => {
      let ret: Promise<InitialFetchDataInterface> = new Promise<InitialFetchDataInterface>((resolve, reject) => (resolve({ time_data: null, axis_data: null })));

      await timeoutFetch<Array<ROSAxisStateInterface>>(
        `/api/backend/historian/axis/${axis_index}?number_of_points=${length}`,
        5000
      )
        .then((data) => {
          if (data) {
            let data_documents = new DatabaseROSAxisStateArray(data);
            console.log("Got initial data");

            // if (axis_index == 0) {
            //   setTimeData(() =>
            //     data_documents.documents
            //       .map((d) => ({
            //         time: d.stamp.sec + d.stamp.nanosec / 1e9,
            //       }))
            //       .reverse()
            //   );
            // }

            const time_data = data_documents.documents
              .map((d) => ({
                time: d.stamp.sec + d.stamp.nanosec / 1e9,
              }))
              .reverse();

            // setAxisData((d) => ({
            //   ...d,
            //   [axis_index]: data_documents.documents
            //     .map((d) => ({
            //       stamp: d.stamp,
            //       axis_index: axis_index,
            //       position: d.position,
            //       velocity: d.velocity,
            //     }))
            //     .reverse(),
            // }));

            // const axis_data = {
            //   [axis_index]: data_documents.documents
            //     .map((d) => ({
            //       stamp: d.stamp,
            //       axis_index: axis_index,
            //       position: d.position,
            //       velocity: d.velocity,
            //     }))
            //     .reverse(),
            // };
            const axis_data = 
              data_documents.documents
                .map((d) => ({
                  stamp: d.stamp,
                  axis_index: axis_index,
                  position: d.position,
                  velocity: d.velocity,
                }))
                .reverse();
            

            // initial_data_acquired[axis_index].current = true;
            initial_data_acquired.current = {
              ...initial_data_acquired.current,
              [axis_index]: true,
            };

            // return { time_data: time_data, axis_data: axis_data };
            ret = new Promise<InitialFetchDataInterface>((resolve, reject) => (
              resolve({ time_data: time_data, axis_data: axis_data })
              // console.log("resolve")
              // return { time_data: time_data, axis_data: axis_data }
            ));
          }
        })
        .catch((e) => {
          console.error(
            `Error acquiring initial plot data of length ${length} for axis index ${axis_index}: ${e}`
          );
          // initial_data_acquired[axis_index].current = false;
          initial_data_acquired.current = {
            ...initial_data_acquired.current,
            [axis_index]: false,
          };

          // ret = { time_data: null, axis_data: null }
          // ret = new Promise<InitialFetchDataInterface>((resolve, reject) => (resolve({ time_data: null, axis_data: null })));
        });

      return ret;
        // return { time_data: null, axis_data: null };
    };

    const fill_initial_data = async () => {
      Object.keys(motionPlotContext.plot_lengths).forEach(
        (plot_key, plot_index) => {
          const plot_length = motionPlotContext.plot_lengths[plot_key];
          props.available_axes.forEach((axis_index) => {
            if (!initial_data_acquired.current?.[plot_key][axis_index]) {
              get_initial_data(axis_index, plot_length)
              // .then((d) => {
              //   console.log(d);
              //   return d;
              // })
              .then(
                ({ time_data, axis_data }) => {
                  // setCompleteTimeData((d) => ({ ...d, [plot_key]: time_data }));
                  if (time_data && axis_data) {
                    initial_data_acquired.current = {
                      ...initial_data_acquired.current,
                      [plot_key]: {
                        ...initial_data_acquired.current[plot_key],
                        [axis_index]: true,
                      }
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
    }

    fill_initial_data()
    

    // props.axes.forEach((i) => {
    //   if (!initial_data_acquired.current?.[i]) get_initial_data(i, );
    //   console.log(`Acquiring data for axis ${i}`);
    // });

    // if (!initial_data_acquired.current) get_initial_data();
    // }, [dashboardContext.heartbeat_counter]);
  }, [motionPlotContext.plot_lengths]);

  useEffect(() => {
    const last_time = timeData?.slice(-1)[0]?.time;
    const new_time =
      dashboardContext.axis_data[0]?.stamp.sec +
      dashboardContext.axis_data[0]?.stamp.nanosec / 1e9;

    if (new_time) {
      if (last_time) {
        if (new_time != last_time) {
          setTimeData(
            (d) => [
              ...d,
              {
                time: new_time,
              },
            ] //.slice(-plotLength)
          );
        }
      } else {
        setTimeData(
          (d) => [
            ...d,
            {
              time: new_time,
            },
          ] //.slice(-plotLength)
        );
      }
    }

    Object.keys(dashboardContext.axis_data).forEach((k, i) => {
      const axis_index = parseInt(k);

      const last_entry = axisData[axis_index]?.slice(-1)?.[0];
      if (last_entry) {
        const last_data_time =
          last_entry.stamp.sec + last_entry.stamp.nanosec / 1e9;
        const current_data_time =
          dashboardContext.axis_data[axis_index].stamp.sec +
          dashboardContext.axis_data[axis_index].stamp.nanosec / 1e9;
        if (last_data_time != current_data_time) {
          setAxisData((d) =>
            // return
            ({
              ...d,
              [axis_index]: [
                ...d[axis_index],
                dashboardContext.axis_data[axis_index],
              ], //.slice(-plotLength),
            })
          );
        }
      } else {
        setAxisData((d) => ({
          ...d,
          [axis_index]: [dashboardContext.axis_data[axis_index]],
        }));
      }
    });
  });

  // useEffect(() => {
  //   const last_time = timeData?.slice(-1)[0]?.time;
  //   const new_time =
  //     dashboardContext.axis_data[0]?.stamp.sec +
  //     dashboardContext.axis_data[0]?.stamp.nanosec / 1e9;

  //   if (new_time) {
  //     if (last_time) {
  //       if (new_time != last_time) {
  //         setTimeData(
  //           (d) => [
  //             ...d,
  //             {
  //               time: new_time,
  //             },
  //           ] //.slice(-plotLength)
  //         );
  //       }
  //     } else {
  //       setTimeData(
  //         (d) => [
  //           ...d,
  //           {
  //             time: new_time,
  //           },
  //         ] //.slice(-plotLength)
  //       );
  //     }
  //   }

  //   Object.keys(dashboardContext.axis_data).forEach((k, i) => {
  //     const axis_index = parseInt(k);

  //     const last_entry = axisData[axis_index]?.slice(-1)?.[0];
  //     if (last_entry) {
  //       const last_data_time =
  //         last_entry.stamp.sec + last_entry.stamp.nanosec / 1e9;
  //       const current_data_time =
  //         dashboardContext.axis_data[axis_index].stamp.sec +
  //         dashboardContext.axis_data[axis_index].stamp.nanosec / 1e9;
  //       if (last_data_time != current_data_time) {
  //         setAxisData((d) =>
  //           // return
  //           ({
  //             ...d,
  //             [axis_index]: [
  //               ...d[axis_index],
  //               dashboardContext.axis_data[axis_index],
  //             ], //.slice(-plotLength),
  //           })
  //         );
  //       }
  //     } else {
  //       setAxisData((d) => ({
  //         ...d,
  //         [axis_index]: [dashboardContext.axis_data[axis_index]],
  //       }));
  //     }
  //   });
  // });

  // return
  return dashboardContext.configuration?.configured ? (
    <>
      {/* <MotionPlot
        title={"Axis Velocities"}
        data_key="velocity"
        unit="rev/s"
        axes={[0, 1]}
        length={100}
        y_axis_transformation={(v) => v + 10}
      />
      <MotionPlot
        title={"Axis Positions"}
        data_key="position"
        unit="rev"
        axes={[0, 1]}
        length={100}
        y_axis_transformation={(v) => v + 5}
      /> */}
      {Object.keys(completeAxisData).map((plot_key, dataset) => (
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
          selected_length={100}
          y_axis_transformation={(y) => y}
          plot_length_setter={(plot_key, length) =>
            setMotionPlotContext((c) => ({
              ...c,
              plot_lengths: {
                ...c.plot_lengths,
                [plot_key]: length,
              },
            }))
          }
        />
      ))}
      {/* <SimpleMotionPlot
        title={"Axis Positions"}
        data_key="position"
        unit="rev"
        axes={[0, 1]}
        length={100}
        y_axis_transformation={(v) => v + 5}
      /> */}
    </>
  ) : (
    <LoadingIndicator />
  );
}

export function MotionPlotContainer(): ReactElement {
  const { dashboardContext } = useContext(DashboardContext);

  // if (dashboardContext.axis_data)
  // setAxisData((d) => {

  // })
  // }, [dashboardContext.axis_data]);
  return dashboardContext.configuration?.configured ? (
    <>
      {/* <MotionPlot
        title={"Axis Velocities"}
        data_key="velocity"
        unit="rev/s"
        axes={[0, 1]}
        length={100}
        y_axis_transformation={(v) => v + 10}
      />
      <MotionPlot
        title={"Axis Positions"}
        data_key="position"
        unit="rev"
        axes={[0, 1]}
        length={100}
        y_axis_transformation={(v) => v + 5}
      /> */}
      <MotionPlotContextProvider>
        <MotionPlots
          available_axes={[0, 1, 2, 3]}
          plot_types={["velocity", "position"]}
        />
        {/* <SimpleMotionPlot
          title={"Axis Positions"}
          data_key="position"
          unit="rev"
          axes={[0, 1]}
          length={100}
          y_axis_transformation={(v) => v + 5}
        /> */}
      </MotionPlotContextProvider>
    </>
  ) : (
    <LoadingIndicator />
  );
}
