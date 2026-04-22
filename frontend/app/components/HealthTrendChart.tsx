"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props {
  history: { month: string; score: number }[];
}

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "short" });
}

export default function HealthTrendChart({ history }: Props) {
  const data = history.map((h) => ({
    month: formatMonth(h.month),
    score: h.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(v) => [`${v}`, "Health Score"]}
        />
        <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 4" label={{ value: "Healthy", position: "right", fontSize: 10, fill: "#10b981" }} />
        <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "At Risk", position: "right", fontSize: 10, fill: "#f59e0b" }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ r: 3, fill: "#7c3aed" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
