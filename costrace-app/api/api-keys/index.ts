import api from "@/lib/axios"

export interface APIKey {
  id: number
  user_id: number
  name: string
  key: string
  created_at: string
}

export function getApiKeys() {
  return api.get<APIKey[]>("/v1/api-keys")
}

export function createApiKey(name: string) {
  return api.post<APIKey>("/v1/api-keys", { name })
}

export function deleteApiKey(id: number) {
  return api.delete(`/v1/api-keys/${id}`)
}
