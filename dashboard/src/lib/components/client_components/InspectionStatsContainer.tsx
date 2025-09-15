"use client";

import { useState, useContext, useEffect } from "react";

interface InspectionStats {
  total_inspected_today: number;
  total_inspected_hour: number;
  pass_rate: number;
  fail_rate: number;
  defect_breakdown: {
    dents: number;
    cracks: number;
    spots: number;
  };
  avg_processing_time: number;
  current_throughput: number;
}

interface InspectionStatsContainerProps {
  layout?: "compact" | "full";
  showDefectBreakdown?: boolean;
  showPerformanceMetrics?: boolean;
  refreshInterval?: number;
  className?: string;
}

const InspectionStatsContainer = ({
  layout = "full",
  showDefectBreakdown = true,
  showPerformanceMetrics = true,
  refreshInterval = 5000,
  className = "",
}: InspectionStatsContainerProps) => {
  const [stats, setStats] = useState<InspectionStats>({
    total_inspected_today: 0,
    total_inspected_hour: 0,
    pass_rate: 0,
    fail_rate: 0,
    defect_breakdown: {
      dents: 0,
      cracks: 0,
      spots: 0,
    },
    avg_processing_time: 0,
    current_throughput: 0,
  });

  const [isActive, setIsActive] = useState(false);

  // Mock data generator
  useEffect(() => {
    const generateMockStats = () => {
      const mockStats: InspectionStats = {
        total_inspected_today: Math.floor(Math.random() * 500) + 200,
        total_inspected_hour: Math.floor(Math.random() * 50) + 10,
        pass_rate: Math.floor(Math.random() * 20) + 75, // 75-95%
        fail_rate: 0,
        defect_breakdown: {
          dents: Math.floor(Math.random() * 8) + 1,
          cracks: Math.floor(Math.random() * 5) + 1,
          spots: Math.floor(Math.random() * 12) + 3,
        },
        avg_processing_time: Math.floor(Math.random() * 500) + 200, // ms
        current_throughput: Math.floor(Math.random() * 20) + 30, // parts/min
      };

      mockStats.fail_rate = 100 - mockStats.pass_rate;
      setStats(mockStats);
    };

    generateMockStats();

    // Update stats every refreshInterval if active
    const interval = setInterval(() => {
      if (isActive) {
        generateMockStats();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isActive, refreshInterval]);

  const totalDefects = Object.values(stats.defect_breakdown).reduce(
    (a, b) => a + b,
    0
  );
  const isCompact = layout === "compact";

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Control Toggle - Smaller */}
      <button
        onClick={() => setIsActive(!isActive)}
        className={`w-full px-2 py-1 text-xs font-medium rounded transition-colors ${
          isActive
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }`}
      >
        {isActive ? "📊 Live" : "▶️ Start"}
      </button>

      {/* Main Stats Grid - Smaller */}
      <div className="grid grid-cols-2 gap-2">
        {/* Today's Total */}
        <div className="bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Today</div>
          <div className="text-md font-bold text-white">
            {stats.total_inspected_today}
          </div>
          <div className="text-xs text-gray-400">parts</div>
        </div>

        {/* Current Hour */}
        <div className="bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Hour</div>
          <div className="text-md font-bold text-white">
            {stats.total_inspected_hour}
          </div>
          <div className="text-xs text-gray-400">parts</div>
        </div>

        {/* Pass Rate */}
        <div className="bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Pass</div>
          <div className="text-md font-bold text-green-400">
            {stats.pass_rate}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div
              className="bg-green-400 h-1 rounded-full"
              style={{ width: `${stats.pass_rate}%` }}
            ></div>
          </div>
        </div>

        {/* Fail Rate */}
        <div className="bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xs text-gray-400">Fail</div>
          <div className="text-md font-bold text-red-400">
            {stats.fail_rate}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div
              className="bg-red-400 h-1 rounded-full"
              style={{ width: `${stats.fail_rate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Defect Breakdown - Compact */}
      {showDefectBreakdown && (
        <div className="bg-gray-800 p-3 rounded border border-gray-600">
          <div className="text-xs font-medium text-white mb-1">Defects</div>
          <div className="space-y-1">
            {Object.entries(stats.defect_breakdown).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-xs text-gray-400 capitalize">{type}</span>
                <span className="text-xs font-medium text-yellow-400">
                  {count}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-600 pt-1 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-300">Total</span>
                <span className="text-xs font-bold text-red-400">
                  {totalDefects}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics - Compact */}
      {showPerformanceMetrics && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400">Time</div>
            <div className="text-xs font-bold text-blue-400">
              {stats.avg_processing_time}ms
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400">Rate</div>
            <div className="text-xs font-bold text-purple-400">
              {stats.current_throughput}/min
            </div>
          </div>
        </div>
      )}

      {/* Live Indicator - Smaller */}
      {isActive && (
        <div className="text-center">
          <span className="text-green-400 text-xs animate-pulse">● Live</span>
        </div>
      )}
    </div>
  );
};

// Export different variations like JogContainer does
export const CompactInspectionStats = (
  props: Omit<InspectionStatsContainerProps, "layout">
) => <InspectionStatsContainer {...props} layout="compact" />;

export const SimpleInspectionStats = (
  props: Omit<
    InspectionStatsContainerProps,
    "showDefectBreakdown" | "showPerformanceMetrics"
  >
) => (
  <InspectionStatsContainer
    {...props}
    showDefectBreakdown={false}
    showPerformanceMetrics={false}
  />
);

// Default export
export default InspectionStatsContainer;