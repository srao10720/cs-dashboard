"use client";
import { PortfolioStats } from "../lib/types";
import { formatARR } from "../lib/utils";

interface Props { stats: PortfolioStats }

export default function StatsBar({ stats }: Props) {
  const tiles = [
    { label: "Total Accounts", value: stats.total_customers, sub: `${formatARR(stats.total_arr)} ARR`, color: "text-gray-900" },
    { label: "Healthy", value: stats.healthy, sub: "score ≥ 75", color: "text-emerald-600" },
    { label: "At Risk", value: stats.at_risk, sub: "score 55–74", color: "text-amber-600" },
    { label: "High Risk / Critical", value: stats.high_risk + stats.critical, sub: `${formatARR(stats.at_risk_arr)} ARR at risk`, color: "text-red-600" },
    { label: "Avg Health Score", value: `${stats.avg_health_score}`, sub: "across portfolio", color: "text-violet-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500">{t.label}</p>
          <p className={`text-2xl font-bold mt-1 ${t.color}`}>{t.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
        </div>
      ))}
    </div>
  );
}
