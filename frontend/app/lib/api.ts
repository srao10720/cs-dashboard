import { CustomerSummary, CustomerDetail, PortfolioStats, AIInsight } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function fetchStats(): Promise<PortfolioStats> {
  const res = await fetch(`${BASE}/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchCustomers(): Promise<CustomerSummary[]> {
  const res = await fetch(`${BASE}/customers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function fetchCustomer(id: number): Promise<CustomerDetail> {
  const res = await fetch(`${BASE}/customers/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Customer not found");
  return res.json();
}

export async function generateInsight(id: number): Promise<AIInsight> {
  const res = await fetch(`${BASE}/customers/${id}/insights`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to generate insight");
  return res.json();
}
