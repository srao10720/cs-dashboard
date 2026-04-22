"use client";
import { Trend } from "../lib/types";

export default function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up")   return <span className="text-emerald-500 font-bold text-sm">↑</span>;
  if (trend === "down") return <span className="text-red-500 font-bold text-sm">↓</span>;
  return <span className="text-gray-400 text-sm">→</span>;
}
