export interface TraceData {
  provider: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost_usd: number;
  api_key: string;
  status: string;
  error?: string;
}

let _apiKey: string | null = null;
let _endpoint = "https://api.costrace.dev/v1/traces";

export function configure(apiKey: string, endpoint?: string): void {
  _apiKey = apiKey;
  if (endpoint) {
    _endpoint = endpoint;
  }
}

export function createTrace(params: {
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  costUsd: number;
  apiKey: string;
  status: string;
  error?: string;
}): TraceData {
  const trace: TraceData = {
    provider: params.provider,
    model: params.model,
    tokens_in: params.tokensIn,
    tokens_out: params.tokensOut,
    latency_ms: params.latencyMs,
    cost_usd: params.costUsd,
    api_key: params.apiKey,
    status: params.status,
  };

  if (params.error) {
    trace.error = params.error;
  }

  return trace;
}

export function sendTrace(data: TraceData): boolean {
  if (!_apiKey) {
    return false;
  }

  fetch(_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${_apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(5000),
  })
    .then((res) => {
      if (!res.ok) {
        res.text().then((text) => {
          console.warn(`[Costrace] Error response: ${text}`);
        });
      }
    })
    .catch((err) => {
      console.warn(`[Costrace] Failed to send trace: ${err}`);
    });

  return true;
}

export function getApiKey(): string | null {
  return _apiKey;
}
