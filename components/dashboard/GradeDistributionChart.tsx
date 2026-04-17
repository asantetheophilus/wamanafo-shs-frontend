// ============================================================
// Wamanafo SHS — Grade Distribution Chart
// Recharts bar chart showing count per grade for current term.
// ============================================================

"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const GRADE_COLOURS: Record<string, string> = {
  A1: "#15803d", B2: "#16a34a", B3: "#4ade80",
  C4: "#ca8a04", C5: "#eab308", C6: "#fde047",
  D7: "#ea580c", E8: "#dc2626", F9: "#991b1b",
};

interface GradeData {
  grade: string;
  count: number;
}

interface GradeDistributionChartProps {
  data: GradeData[];
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No approved scores for this term yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="grade"
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]!;
            const pct = total > 0 ? ((Number(d.value) / total) * 100).toFixed(1) : "0";
            return (
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
                <p className="font-bold text-slate-800">{d.payload.grade}</p>
                <p className="text-slate-600">{d.value} students ({pct}%)</p>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry) => (
            <Cell
              key={entry.grade}
              fill={GRADE_COLOURS[entry.grade] ?? "#64748b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
