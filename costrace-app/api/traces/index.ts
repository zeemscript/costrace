import api from "@/lib/axios";
import type { Trace } from "@/types/trace";

export type { Trace };

export interface TraceFilters {
  api_key?: string;
  provider?: string;
  status?: string;
  from?: string;
  page?: number;
  per_page?: number;
  team_id?: number;
}

export interface PaginatedTraces {
  data: Trace[];
  total: number;
  page: number;
  per_page: number;
}

export function getTraces(params?: TraceFilters) {
  return api.get<PaginatedTraces>("/v1/traces", { params });
}
