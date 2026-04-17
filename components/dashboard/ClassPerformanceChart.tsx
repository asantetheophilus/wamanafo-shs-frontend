// ============================================================
// Wamanafo SHS — Class Performance Chart
// Horizontal bar chart: average total score per class.
// ============================================================

"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface ClassData {
  className:    string;
  averageScore: number | null;
}

interface ClassPerformanceChartProps {
  data: ClassData[];
}

export function ClassPerformanceChart({ data }: ClassPerformanceChartProps) {
  const withScores = data.filter((d) => d.averageScore !== null);

  if (withScores.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No approved scores available yet.
      </div>
    );
  }

  const chartData = withScores.map((d) => ({
    name:  d.className,
    score: d.averageScore,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, withScores.length * 36)}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickCount={6}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
                <p className="font-bold text-slate-800">{payload[0]!.payload.name}</p>
                <p className="text-slate-600">
                  Average: <strong>{Number(payload[0]!.value).toFixed(1)}</strong>
                </p>
              </div>
            );
          }}
        />
        {/* Pass mark reference line at 50 */}
        <ReferenceLine x={50} stroke="#e2e8f0" strokeDasharray="4 2" />
        <Bar
          dataKey="score"
          radius={[0, 4, 4, 0]}
          maxBarSize={24}
          fill="#0D5E6E"
          label={{
            position: "right",
            fontSize:  10,
            fill:      "#64748b",
            formatter: (v: number) => v.toFixed(1),
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
