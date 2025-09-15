"use client";

import InspectionStatsContainer from "@/lib/components/client_components/InspectionStatsContainer";
import { SimplifiedDashboardHeaderContainer } from "../components/server_components/SimplifiedDashboardHeaderContainer";

export const AIModelStatisticsPanel = (props: {
  id: string;
  className?: string;
  fill_tile_callback?: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <SimplifiedDashboardHeaderContainer
      title="Statistics"
      icon_path={"/icons/chart.svg"}
      className={props.className || ""}
    >
      <div className="w-full h-full flex flex-col p-3 bg-gray-900">
        <InspectionStatsContainer
          layout="full"
          showDefectBreakdown={true}
          showPerformanceMetrics={true}
          refreshInterval={5000}
        />
      </div>
    </SimplifiedDashboardHeaderContainer>
  );
};
