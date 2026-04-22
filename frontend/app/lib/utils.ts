import { Platform, RiskLevel } from "./types";

export const PLATFORM_LABELS: Record<Platform, string> = {
  sales_cloud: "Sales Cloud",
  service_cloud: "Service Cloud",
  slack: "Slack",
  experience_cloud: "Experience Cloud",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  sales_cloud: "bg-blue-100 text-blue-700",
  service_cloud: "bg-purple-100 text-purple-700",
  slack: "bg-green-100 text-green-700",
  experience_cloud: "bg-orange-100 text-orange-700",
};

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; ring: string; bar: string }> = {
  low:      { bg: "bg-emerald-50",  text: "text-emerald-700", ring: "ring-emerald-200", bar: "bg-emerald-500" },
  medium:   { bg: "bg-amber-50",    text: "text-amber-700",   ring: "ring-amber-200",   bar: "bg-amber-400"   },
  high:     { bg: "bg-orange-50",   text: "text-orange-700",  ring: "ring-orange-200",  bar: "bg-orange-500"  },
  critical: { bg: "bg-red-50",      text: "text-red-700",     ring: "ring-red-200",     bar: "bg-red-500"     },
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Healthy",
  medium: "At Risk",
  high: "High Risk",
  critical: "Critical",
};

export function formatARR(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function daysUntilRenewal(renewalDate: string): number {
  const diff = new Date(renewalDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function renewalUrgency(days: number): string {
  if (days < 0) return "text-red-600";
  if (days < 90) return "text-orange-600";
  if (days < 180) return "text-amber-600";
  return "text-gray-500";
}
