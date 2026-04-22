import { fetchCustomers, fetchStats } from "./lib/api";
import StatsBar from "./components/StatsBar";
import CustomerCard from "./components/CustomerCard";

export default async function Home() {
  const [stats, customers] = await Promise.all([fetchStats(), fetchCustomers()]);

  const critical = customers.filter((c) => c.risk_level === "critical");
  const high = customers.filter((c) => c.risk_level === "high");
  const medium = customers.filter((c) => c.risk_level === "medium");
  const healthy = customers.filter((c) => c.risk_level === "low");

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Account Portfolio</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Health scores calculated from usage, NPS, support tickets, CSM engagement, and feature adoption.
        </p>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Critical */}
      {critical.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
            Critical — Immediate Action Required ({critical.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {critical.map((c) => <CustomerCard key={c.id} customer={c} />)}
          </div>
        </section>
      )}

      {/* High risk */}
      {high.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span>
            High Risk ({high.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {high.map((c) => <CustomerCard key={c.id} customer={c} />)}
          </div>
        </section>
      )}

      {/* At risk */}
      {medium.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span>
            At Risk ({medium.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {medium.map((c) => <CustomerCard key={c.id} customer={c} />)}
          </div>
        </section>
      )}

      {/* Healthy */}
      {healthy.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>
            Healthy ({healthy.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {healthy.map((c) => <CustomerCard key={c.id} customer={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
