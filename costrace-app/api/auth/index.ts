import api from "@/lib/axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function initiateGithubAuth() {
  window.location.href = `${API_URL}/auth/github`;
}

export async function requestEmailLink(email: string) {
  return api.post(`${API_URL}/auth/magic-link`, { email });
}
