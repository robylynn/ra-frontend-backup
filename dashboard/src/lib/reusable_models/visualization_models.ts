// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { DatabaseDocumentArray } from "@/lib/reusable_models/database_models";

export class ChartDataTrace {
  constructor(
    public color: string = "",
    public y_data_value_name: string = "",
    public y_values: Array<number> = [],
  ) {}
}

export class MultitraceChartDataset {
  constructor(
    public x_data_value_name: string = "",
    public x_values: Array<number> = [],
    public traces: Record<string, ChartDataTrace> = {},
  ) {}
}

export interface ChartStates {
  charts: {
    [chart_id: string]: {
      number_of_points_shown: number;
      chart_data: MultitraceChartDataset;
    };
  };
  full_dataset: DatabaseDocumentArray;
}
