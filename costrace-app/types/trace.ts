export interface Trace {
  id: number
  created_at: string
  provider: string
  model: string
  tokens_in: number
  tokens_out: number
  cost_usd: number
  latency_ms: number
  status: string
  error?: string
}
