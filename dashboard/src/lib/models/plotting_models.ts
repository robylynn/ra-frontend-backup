import { AxisData } from "@/lib/models/ros_models";

export type PlotTimeData = Array<AxisTimeDataInterface>;
export type PlotAxisData = Record<number, Array<AxisData>>;

export interface AxisTimeDataInterface {
  time: number;
}