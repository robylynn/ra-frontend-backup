import { IRosTypeR2CInterfacesEncoderEstimates } from "@/lib/models/ros_types";

export type PlotTimeData = Array<AxisTimeDataInterface>;
export type PlotAxisData = Record<number, Array<IRosTypeR2CInterfacesEncoderEstimates>>;

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