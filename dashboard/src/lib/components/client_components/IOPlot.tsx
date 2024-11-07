import { useEffect, useMemo, useState, useRef } from "react";
import { R2Button } from "@/lib/components/client_components/ClickButton";
import { IODataPoint } from "@/lib/models/plotting_models";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { plotDateFormatter } from "@/lib/utils/plotDateFormatter";
import { strokeColor } from "@/lib/utils/chartColorPicker";
import { IOPointConfiguration } from "@/lib/models/api_models";
import LoadingIndicator from "@/lib/components/server_components/loading_indicator";

const IOPlot = (props: {
  data: Array<IODataPoint>;
  data_name: string;
  y_label?: string;
  plot_index: number;
  data_sources: Array<number>;
  initial_data_acquired: boolean;
  selected_io_channels: Array<IOPointConfiguration>;
  available_io_channels: Array<IOPointConfiguration>;
  base_plot_length: number;
  selected_update_rate: number;
  selected_plot_length: number;
  delete_plot_callback: (plot_index: number) => void;
  add_trace_callback: (io_channel: number) => void;
  change_update_rate_callback: (update_rate: number) => void;
  change_plot_length_callback: (plot_length: number) => void;
}) => {

  const [plotUpdateCounter, setPlotUpdateCounter] = useState<number>(
    props.selected_update_rate
  );

  const plottedData = useMemo(() => props.data, [plotUpdateCounter, props.initial_data_acquired]);
  const [selectedDataSource, setSelectedDataSource] = useState<number>(
    props.available_io_channels?.[0]?.channel
  );
  const [activeSeries, setActiveSeries] = useState<Array<number>>(
    props.data_sources
  );

  useEffect(() => {
    setSelectedDataSource(() => props.available_io_channels?.[0]?.channel);
  }, [JSON.stringify(props.available_io_channels)]);

  useEffect(() => {
    const intervalId = setInterval(
      () => {
        console.log(`Update rate for plot is ${props.selected_update_rate}`);

        setPlotUpdateCounter((counter) => counter + 1);
      },
      props.selected_update_rate > 0 ? props.selected_update_rate * 1000 : 1000
    );
    return () => clearInterval(intervalId);
  }, [props.selected_update_rate]);

  const handleLegendClick = (data_source_index: number) => {
    if (activeSeries.includes(data_source_index)) {
      setActiveSeries(
        activeSeries.filter(
          (displayed_data_source) => displayed_data_source !== data_source_index
        )
      );
    } else {
      setActiveSeries((s) => [...s, data_source_index]);
    }
  };

  return (
    <div>
      <div className="flex flex-row justify-between py-2">
        {/* <h2>{`${props.data_name}`}</h2> */}
        <select
          className="w-[40%]"
          value={selectedDataSource}
          onChange={(e) => setSelectedDataSource(parseInt(e.target.value))}
          disabled={props.available_io_channels.length < 1}
        >
          {props.available_io_channels.map((input, index) => {
            const label =
              input.label != ""
                ? `${input.label} (Input ${input.channel})`
                : `Input ${input.channel}`;
            return (
              <option key={index} value={input.channel}>
                {label}
              </option>
            );
          })}
        </select>

        <R2Button
          text="Add Trace"
          disabled={!props.available_io_channels.length}
          onClick={() => {
            setSelectedDataSource(
              () => props.available_io_channels?.[0]?.channel
            );
            setActiveSeries((s) => [...s, selectedDataSource]);
            props.add_trace_callback(selectedDataSource);
          }}
        />
        <div className="flex flex-col items-center">
          <p className="text-r2-white">Update Rate</p>
          <select
            onChange={(e) =>
              props.change_update_rate_callback(parseInt(e.target.value))
            }
            value={props.selected_update_rate}
          >
            {[1, 5, 10]
              .sort((a, b) => (a > b ? a : b))
              .map((p, i) => (
                <option key={i} value={p}>
                  {p}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-r2-white">Length</p>
          <select
            onChange={(e) =>
              props.change_plot_length_callback(parseInt(e.target.value))
            }
            value={props.selected_plot_length}
          >
            {[
              props.base_plot_length,
              props.base_plot_length * 2,
              props.base_plot_length * 10,
              props.base_plot_length * 50,
            ]
              .sort((a, b) => (a > b ? a : b))
              .map((p, i) => (
                <option key={i} value={p}>
                  {p}
                </option>
              ))}
          </select>
        </div>
        <R2Button
          text="Remove Plot"
          onClick={() => {
            props.delete_plot_callback(props.plot_index);
          }}
        />
      </div>
      {/* <Plot data={props.data} data_sources={props.data_sources} y_label={props.y_label} /> */}
      <ResponsiveContainer width="100%" height={400}>
        {/* <> */}
        {!props.initial_data_acquired ? <LoadingIndicator text="FETCHING DATA"/> : 
        <LineChart data={plottedData}>
          <CartesianGrid strokeDasharray="3 3" />

          {props.data_sources.length ? (
            <>
              <XAxis
                scale={"linear"}
                dataKey="time"
                name={"Time"}
                tickFormatter={plotDateFormatter}
                tickCount={2}
                // interval={"equidistantPreserveStart"}
              />
              <YAxis
                label={{
                  // value: props.y_label ?? "Input Value",
                  value: props.selected_io_channels.reduce(
                    (label_string, selected_channel) =>
                      selected_channel.measurement_unit
                        ? label_string +
                          ` / ${selected_channel.measurement_unit}`
                        : label_string,
                    ""
                  ) ?? "Unknown Units",
                  angle: -90,
                }}
              />
            </>
          ) : (
            <></>
          )}

          <Legend
            onClick={(props) =>
              handleLegendClick(parseInt((props.payload as any).id as string))
            }
          />
          <Tooltip />
          {props.data_sources
            .sort((a, b) => (b > a ? -1 : 1))
            .map((s) => (
              <Line
                id={s.toString()}
                key={s}
                type="monotone"
                dataKey={s}
                name={`IO ${s}`}
                hide={!activeSeries.includes(s)}
                // stroke={props.stroke_color ?? "#8884d8"}
                stroke={`#${strokeColor(s)}`}
                isAnimationActive={false}
                animationBegin={0}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            ))}
        </LineChart>
        }
        {/* </> */}
      </ResponsiveContainer>
    </div>
  );
};

export default IOPlot;
