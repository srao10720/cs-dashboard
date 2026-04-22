export type RiskLevel = "low" | "medium" | "high" | "critical";
export type Trend = "up" | "down" | "flat";
export type Platform = "sales_cloud" | "service_cloud" | "slack" | "experience_cloud";

export interface CustomerSummary {
  id: number;
  name: string;
  platform: Platform;
  tier: string;
  csm_name: string;
  renewal_date: string;
  contract_value: number;
  industry: string;
  employee_count: number;
  licensed_seats: number;
  health_score: number;
  health_label: string;
  risk_level: RiskLevel;
  trend: Trend;
  maturity_stage: string;
  maturity_index: number;
  active_users: number;
  last_csm_contact_days: number;
  nps_score: number | null;
}

export interface CustomerDetail extends CustomerSummary {
  health_components: Record<string, number>;
  health_weights: Record<string, number>;
  history: { month: string; score: number }[];
  metrics: {
    active_users: number;
    last_login_days_ago: number;
    nps_score: number | null;
    open_tickets: number;
    avg_resolution_days: number;
    feature_adoption_pct: number;
    maturity_stage: string;
    last_csm_contact_days: number;
    qbrs_completed_ytd: number;
    extra_metrics: string | null;
  };
  maturity_stages: string[];
}

export interface PortfolioStats {
  total_customers: number;
  healthy: number;
  at_risk: number;
  high_risk: number;
  critical: number;
  avg_health_score: number;
  total_arr: number;
  at_risk_arr: number;
}

export interface AIInsight {
  risk_level: RiskLevel;
  summary: string;
  recommendations: string[];
  generated_at: string;
  cached: boolean;
}
