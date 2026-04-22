import Link from "next/link";
import { fetchCustomer } from "../../lib/api";
import { PLATFORM_LABELS, PLATFORM_COLORS, RISK_COLORS, RISK_LABELS, formatARR, daysUntilRenewal, renewalUrgency } from "../../lib/utils";
import HealthRing from "../../components/HealthRing";
import TrendIcon from "../../components/TrendIcon";
import ScoreBreakdown from "../../components/ScoreBreakdown";
import AIInsightPanel from "../../components/AIInsightPanel";
import HealthTrendChart from "../../components/HealthTrendChart";

interface Props { params: { id: string } }

export default async function CustomerPage({ params }: Props) {
  const customer = await fetchCustomer(Number(params.id));
  const colors = RISK_COLORS[customer.risk_level];
  const m = customer.metrics;
  const days = daysUntilRenewal(customer.renewal_date);
  const usagePct = Math.round((customer.active_users / customer.licensed_seats) * 100);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-gray-700 transition-colors">Portfolio</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{customer.name}</span>
      </div>

      {/* Header card */}
      <div className={`bg-white rounded-xl border ${colors.ring} ring-1 p-5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[customer.platform]}`}>
                {PLATFORM_LABELS[customer.platform]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors.bg} ${colors.text}`}>
                {RISK_LABELS[customer.risk_level]}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span>{customer.tier} Success</span>
              <span>{customer.industry}</span>
              <span>{customer.employee_count.toLocaleString()} employees</span>
              <span>CSM: {customer.csm_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <HealthRing score={customer.health_score} risk={customer.risk_level} size="lg" />
            <div className="text-right">
              <p className="text-sm text-gray-500">ARR</p>
              <p className="text-xl font-bold text-gray-900">{formatARR(customer.contract_value)}</p>
              <p className={`text-xs mt-0.5 ${renewalUrgency(days)}`}>
                Renews {days > 0 ? `in ${days} days` : "overdue"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column: metrics + maturity */}
        <div className="space-y-5">
          {/* Key metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key Metrics</p>
            {[
              { label: "Active Users", value: `${customer.active_users} / ${customer.licensed_seats} (${usagePct}%)` },
              { label: "Avg Days Since Login", value: `${m.last_login_days_ago} days` },
              { label: "NPS Score", value: m.nps_score !== null ? String(m.nps_score) : "—" },
              { label: "Open Tickets", value: String(m.open_tickets), alert: m.open_tickets > 8 },
              { label: "Avg Resolution Time", value: `${m.avg_resolution_days} days`, alert: m.avg_resolution_days > 7 },
              { label: "Feature Adoption", value: `${m.feature_adoption_pct}%` },
              { label: "Last CSM Contact", value: `${m.last_csm_contact_days} days ago`, alert: m.last_csm_contact_days > 30 },
              { label: "QBRs Completed YTD", value: String(m.qbrs_completed_ytd), alert: m.qbrs_completed_ytd === 0 },
            ].map(({ label, value, alert }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{label}</span>
                <span className={`font-medium ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</span>
              </div>
            ))}

            {m.extra_metrics && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Platform Notes</p>
                {m.extra_metrics.split(",").map((note) => (
                  <p key={note} className="text-xs text-gray-600">{note.trim()}</p>
                ))}
              </div>
            )}
          </div>

          {/* Maturity */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Adoption Maturity</p>
            <div className="flex gap-1 mb-2">
              {customer.maturity_stages.map((stage, i) => (
                <div
                  key={stage}
                  title={stage}
                  className={`h-2 flex-1 rounded-full ${i <= customer.maturity_index ? "bg-violet-500" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-violet-700">{m.maturity_stage}</p>
            <p className="text-xs text-gray-400 mt-0.5">Stage {customer.maturity_index + 1} of {customer.maturity_stages.length}</p>
            <div className="mt-3 space-y-1">
              {customer.maturity_stages.map((stage, i) => (
                <div key={stage} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${i <= customer.maturity_index ? "bg-violet-500" : "bg-gray-200"}`} />
                  <span className={i === customer.maturity_index ? "font-semibold text-violet-700" : "text-gray-400"}>{stage}</span>
                  {i === customer.maturity_index && <span className="text-gray-300">← current</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center + right: trend chart, score breakdown, AI */}
        <div className="lg:col-span-2 space-y-5">
          {/* Trend chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">12-Month Health Score Trend</p>
              <div className="flex items-center gap-1 text-sm">
                <TrendIcon trend={customer.trend} />
                <span className="text-xs text-gray-500">{customer.trend === "up" ? "Improving" : customer.trend === "down" ? "Declining" : "Stable"}</span>
              </div>
            </div>
            <HealthTrendChart history={customer.history} />
          </div>

          {/* Score breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <ScoreBreakdown components={customer.health_components} weights={customer.health_weights} />
          </div>

          {/* AI Insight */}
          <AIInsightPanel customerId={customer.id} />
        </div>
      </div>
    </div>
  );
}
