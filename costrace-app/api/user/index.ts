import api from "@/lib/axios"
import type { UserI } from "@/types/user"

export function getCurrentUser() {
  return api.get<UserI>("/v1/user")
}

export function updateUser(data: { email: string }) {
  return api.put<UserI>("/v1/user", data)
}
