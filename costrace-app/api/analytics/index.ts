import api from "@/lib/axios";

export type Period = "7d" | "30d" | "90d";

export interface AnalyticsSummary {
  total_cost: number;
  total_calls: number;
  total_tokens: number;
  avg_latency_ms: number;
}

export interface CostOverTimePoint {
  date: string;
  cost: number;
  calls: number;
  tokens_in: number;
  tokens_out: number;
}

export interface CostByModelPoint {
  model: string;
  provider: string;
  cost: number;
  calls: number;
  tokens_in: number;
  tokens_out: number;
}

export function getAnalyticsSummary(period?: Period, teamId?: number | null) {
  return api.get<AnalyticsSummary>("/v1/analytics/summary", {
    params: { period, team_id: teamId ?? undefined },
  });
}

export function getCostOverTime(period?: Period, teamId?: number | null) {
  return api.get<CostOverTimePoint[]>("/v1/analytics/cost-over-time", {
    params: { period, team_id: teamId ?? undefined },
  });
}

export function getCostByModel(period?: Period, teamId?: number | null) {
  return api.get<CostByModelPoint[]>("/v1/analytics/cost-by-model", {
    params: { period, team_id: teamId ?? undefined },
  });
}
