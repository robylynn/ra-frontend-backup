// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import "chartjs-adapter-date-fns";
import {
  CategoryScale,
  ChartData,
  ChartDataset,
  Legend,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";

import { ChartConfiguration } from "@/lib/reusable_models/api_models";
import { MultitraceChartDataset } from "@/lib/reusable_models/visualization_models";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  Tooltip,
  Legend,
);

export default function ChartContainer(props: {
  configuration: ChartConfiguration;
  chart_data: MultitraceChartDataset;
  className?: string;
}) {
  const timeArray: number[] = [];

  const ms = props.chart_data.x_values;

  ms.forEach((singleElement) => {
    //   ms.forEach((singleElement, index) => {
    timeArray.push(singleElement * 1000);
  });

  const trace_datasets = () => {
    const dataset_array: Array<ChartDataset<"line">> = [];
    for (const trace_name in props.chart_data.traces) {
      const trace_data = props.chart_data.traces[trace_name];
      const zipped_data = timeArray.map(function (e, i) {
        return {
          x: e,
          y: trace_data.y_values[i],
        };
      });

      dataset_array.push({
        label: trace_data.y_data_value_name,
        data: zipped_data,
        fill: false,
        backgroundColor: trace_data.color,
        borderColor: trace_data.color,

        borderCapStyle: "butt",
        borderDash: [],
        borderWidth: 1,
        borderJoinStyle: "miter",
        indexAxis: "x",
        parsing: false,
        pointBorderColor: trace_data.color,
        pointBackgroundColor: trace_data.color,
        pointBorderWidth: 0.2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(37, 150, 190)",
        pointHoverBorderColor: trace_data.color,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
      });
    }
    return dataset_array;
  };

  const data: ChartData<"line"> = {
    datasets: trace_datasets(),
  };

  const decimation = {
    enabled: true,
    algorithm: "lttb",
    samples: 200,
    threshold: 200,
  };

  const options = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      decimation: decimation,
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const timestamp = context[0].parsed.x;
            const date = new Date(timestamp);
            return date.toISOString();
          },
        },
      },
    },
    parsing: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "second",
          // tooltipFormat: 'dd.MM.yyyy - HH:mm:ss'
        },
        scaleLabel: {
          display: true,
          labelString: "Time (UTC)",
          offsetY: 70,
        },
        ticks: {
          callback: function (value: any) {
            const d = new Date(value);
            return d.toISOString().slice(11, 19);
          },
          autoSkip: true,
          maxTicksLimit: 20,
          maxRotation: 45,
          minRotation: 45,
          color: "#A7B0C2",
        },
      },
      y: {
        scaleLabel: {
          display: true,
          labelString: props.configuration.title as any,
          color: "#A7B0C2",
        },
        ticks: {
          // callback: function (value: any, index: any, values: any) {
          callback: function (value: any) {
            return (
              value.toFixed(props.configuration.y_axis_decimal_places) || 0
            );
          },
          color: "#A7B0C2",
        },
        title: {
          display: true,
          text: props.configuration.title,
          fontSize: 16,
          position: "left",
          color: "#A7B0C2",
        },
      },
    },
  } as any;

  return (
    <div className={`w-[95%] h-[40%] ${props.className ?? ""}`}>
      <Line data={data} options={options} />
    </div>
  );
}
