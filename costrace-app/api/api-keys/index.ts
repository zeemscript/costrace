import api from "@/lib/axios";

export interface APIKey {
  id: number;
  user_id: number;
  team_id: number | null;
  name: string;
  key: string;
  created_at: string;
}

export function getApiKeys(teamId?: number | null) {
  return api.get<APIKey[]>("/v1/api-keys", {
    params: { team_id: teamId ?? undefined },
  });
}

export function createApiKey(name: string, teamId?: number | null) {
  return api.post<APIKey>("/v1/api-keys", {
    name,
    team_id: teamId ?? undefined,
  });
}

export function deleteApiKey(id: number, teamId?: number | null) {
  return api.delete(`/v1/api-keys/${id}`, {
    params: { team_id: teamId ?? undefined },
  });
}
