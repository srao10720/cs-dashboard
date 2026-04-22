"use client";
import { RiskLevel } from "../lib/types";
import { RISK_COLORS } from "../lib/utils";

interface Props {
  score: number;
  risk: RiskLevel;
  size?: "sm" | "lg";
}

export default function HealthRing({ score, risk, size = "sm" }: Props) {
  const r = size === "lg" ? 44 : 28;
  const stroke = size === "lg" ? 6 : 4;
  const dim = (r + stroke) * 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const colors = RISK_COLORS[risk];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke="#e5e7eb" strokeWidth={stroke}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colors.text}
        />
      </svg>
      <span className={`absolute text-${size === "lg" ? "xl" : "xs"} font-bold ${colors.text}`}>
        {Math.round(score)}
      </span>
    </div>
  );
}
