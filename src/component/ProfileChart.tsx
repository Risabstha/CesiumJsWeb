import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
 heights: number[];
  distances?: number[]; // <-- add this}
}


// Custom tooltip for recharts
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded px-2 py-1 text-xs shadow">
        <div>distance: {d.distance}</div>
        <div>elevation: {d.elevation}</div>
      </div>
    );
  }
  return null;
}

export default function ProfileChart({ heights, distances }: Props) {
  // Use distances if provided, otherwise fallback to index
  const xValues =
    distances && distances.length === heights.length
      ? distances
      : heights.map((_, i) => i);

  // Build chart data
  const data = xValues.map((dist, i) => ({
    distance: dist.toFixed(4),                // distance in meters
    elevation: heights[i].toFixed(4),
  }));

  return (
    <div className="md:w-[350%] w-[280%] absolute md:h-58 h-48 mt-3 bg-gray-200/90 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="distance"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => Math.round(v).toString()}
            label={{ value: "Distance (m)", offset: -5, position: "insideBottom" }}
          />
          <YAxis
            dataKey="elevation"
            label={{ value: "Elevation (m)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke="#ff0000"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}