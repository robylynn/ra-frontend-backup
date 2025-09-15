"use client";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import InspectionStatsContainer from "@/lib/components/client_components/InspectionStatsContainer";

export const AIModelStatisticsPanel = (props: {
  id: string;
  className?: string;
  fill_tile_callback?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <DashboardHeaderContainer
      header_text="Statistics"
      icon_path={"/icons/chart.svg"}
      className={props.className || ""}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      <div className="w-full h-full flex flex-col p-3 bg-gray-900">
        <InspectionStatsContainer
          layout="full"
          showDefectBreakdown={true}
          showPerformanceMetrics={true}
          refreshInterval={5000}
        />
      </div>
    </DashboardHeaderContainer>
  );
}