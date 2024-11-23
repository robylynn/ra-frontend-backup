import { AxisData } from "@/lib/models/ros_models";

export type PlotTimeData = Array<AxisTimeDataInterface>;
export type PlotAxisData = Record<number, Array<AxisData>>;

export interface AxisTimeDataInterface {
  time: number;
}

export interface PlotDataPoint {
  time: number;
  [key: number]: number;
}

export interface PlotInputDataInterface {
  name: string
  id: number
  data: PlotDataPoint[]
}

export type PlotInputData = Array<PlotInputDataInterface>