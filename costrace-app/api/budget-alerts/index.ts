import api from "@/lib/axios"

export interface BudgetAlert {
  id: number
  user_id: number
  name: string
  scope: "general" | "api_key" | "model"
  scope_value: string
  threshold_usd: number
  period: "daily" | "weekly" | "monthly"
  enabled: boolean
  last_triggered_at: string | null
  created_at: string
}

export interface CreateBudgetAlertBody {
  name: string
  scope: "general" | "api_key" | "model"
  scope_value?: string
  threshold_usd: number
  period: "daily" | "weekly" | "monthly"
}

export interface UpdateBudgetAlertBody {
  name?: string
  threshold_usd?: number
  period?: "daily" | "weekly" | "monthly"
  enabled?: boolean
}

export function getBudgetAlerts() {
  return api.get<BudgetAlert[]>("/v1/budget-alerts")
}

export function createBudgetAlert(body: CreateBudgetAlertBody) {
  return api.post<BudgetAlert>("/v1/budget-alerts", body)
}

export function updateBudgetAlert(id: number, body: UpdateBudgetAlertBody) {
  return api.put<BudgetAlert>(`/v1/budget-alerts/${id}`, body)
}

export function deleteBudgetAlert(id: number) {
  return api.delete(`/v1/budget-alerts/${id}`)
}
