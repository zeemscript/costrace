import api from "@/lib/axios";

export interface BudgetAlert {
  id: number;
  user_id: number;
  team_id: number | null;
  name: string;
  scope: "general" | "api_key" | "model";
  scope_value: string;
  threshold_usd: number;
  period: "daily" | "weekly" | "monthly";
  enabled: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface CreateBudgetAlertBody {
  name: string;
  scope: "general" | "api_key" | "model";
  scope_value?: string;
  threshold_usd: number;
  period: "daily" | "weekly" | "monthly";
}

export interface UpdateBudgetAlertBody {
  name?: string;
  threshold_usd?: number;
  period?: "daily" | "weekly" | "monthly";
  enabled?: boolean;
}

export function getBudgetAlerts(teamId?: number | null) {
  return api.get<BudgetAlert[]>("/v1/budget-alerts", {
    params: { team_id: teamId ?? undefined },
  });
}

export function createBudgetAlert(
  body: CreateBudgetAlertBody,
  teamId?: number | null,
) {
  return api.post<BudgetAlert>("/v1/budget-alerts", {
    ...body,
    team_id: teamId ?? undefined,
  });
}

export function updateBudgetAlert(
  id: number,
  body: UpdateBudgetAlertBody,
  teamId?: number | null,
) {
  return api.put<BudgetAlert>(`/v1/budget-alerts/${id}`, body, {
    params: { team_id: teamId ?? undefined },
  });
}

export function deleteBudgetAlert(id: number, teamId?: number | null) {
  return api.delete(`/v1/budget-alerts/${id}`, {
    params: { team_id: teamId ?? undefined },
  });
}
