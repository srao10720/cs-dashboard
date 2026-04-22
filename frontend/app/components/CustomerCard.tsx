"use client";
import Link from "next/link";
import { CustomerSummary } from "../lib/types";
import { PLATFORM_LABELS, PLATFORM_COLORS, RISK_COLORS, RISK_LABELS, formatARR, daysUntilRenewal, renewalUrgency } from "../lib/utils";
import HealthRing from "./HealthRing";
import TrendIcon from "./TrendIcon";
import MaturityBar from "./MaturityBar";

interface Props { customer: CustomerSummary }

export default function CustomerCard({ customer: c }: Props) {
  const colors = RISK_COLORS[c.risk_level];
  const days = daysUntilRenewal(c.renewal_date);
  const usagePct = Math.round((c.active_users / c.licensed_seats) * 100);

  return (
    <Link href={`/customers/${c.id}`}>
      <div className={`bg-white rounded-xl border ${colors.ring} ring-1 shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col gap-3`}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{c.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[c.platform]}`}>
                {PLATFORM_LABELS[c.platform]}
              </span>
              <span className="text-xs text-gray-400">{c.tier}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{c.industry}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <HealthRing score={c.health_score} risk={c.risk_level} />
            <div className="flex items-center gap-0.5">
              <TrendIcon trend={c.trend} />
            </div>
          </div>
        </div>

        {/* Health label badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {RISK_LABELS[c.risk_level]}
          </span>
          <span className="text-xs text-gray-500">{formatARR(c.contract_value)} ARR</span>
        </div>

        {/* Usage bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Usage</span>
            <span className="font-medium">{c.active_users} / {c.licensed_seats} seats ({usagePct}%)</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full">
            <div
              className={`h-1.5 rounded-full ${colors.bar}`}
              style={{ width: `${Math.min(usagePct, 100)}%` }}
            />
          </div>
        </div>

        {/* Maturity */}
        <MaturityBar stage={c.maturity_stage} />

        {/* Footer row */}
        <div className="flex justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
          <span>NPS: <span className="font-medium text-gray-600">{c.nps_score ?? "—"}</span></span>
          <span className={renewalUrgency(days)}>
            Renews in {days > 0 ? `${days}d` : "overdue"}
          </span>
          <span>Contact: <span className={c.last_csm_contact_days > 30 ? "text-red-500 font-medium" : "text-gray-600 font-medium"}>{c.last_csm_contact_days}d ago</span></span>
        </div>
      </div>
    </Link>
  );
}
