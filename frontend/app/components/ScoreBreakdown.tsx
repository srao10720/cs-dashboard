"use client";

interface Props {
  components: Record<string, number>;
  weights: Record<string, number>;
}

const LABELS: Record<string, string> = {
  usage: "Seat Usage",
  nps: "NPS Score",
  support: "Support Health",
  engagement: "CSM Engagement",
  adoption: "Feature Adoption",
};

const BAR_COLORS: Record<string, string> = {
  usage: "bg-blue-500",
  nps: "bg-violet-500",
  support: "bg-emerald-500",
  engagement: "bg-amber-500",
  adoption: "bg-indigo-500",
};

export default function ScoreBreakdown({ components, weights }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Score Breakdown</p>
      {Object.entries(components).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{LABELS[key] ?? key} <span className="text-gray-400">({Math.round((weights[key] ?? 0) * 100)}% weight)</span></span>
            <span className="font-semibold text-gray-800">{value.toFixed(0)}/100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div
              className={`h-2 rounded-full ${BAR_COLORS[key] ?? "bg-gray-400"}`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
