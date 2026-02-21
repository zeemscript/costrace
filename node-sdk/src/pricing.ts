/**
 * Pricing data for LLM providers.
 * Prices are per 1 million tokens (USD).
 */

interface ModelPricing {
  input: number;
  output: number;
}

const OPENAI_PRICING: Record<string, ModelPricing> = {
  "gpt-5.2": { input: 1.75, output: 14.0 },
  "gpt-5": { input: 1.25, output: 10.0 },
  "gpt-5-mini": { input: 0.25, output: 2.0 },
  "gpt-5-nano": { input: 0.05, output: 0.4 },
  "o3": { input: 2.0, output: 8.0 },
  "o4-mini": { input: 1.1, output: 4.4 },
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4.1": { input: 2.0, output: 8.0 },
  "gpt-4-turbo": { input: 10.0, output: 30.0 },
  "gpt-4": { input: 30.0, output: 60.0 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
};

const ANTHROPIC_PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-6": { input: 5.0, output: 25.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },
  "claude-opus-4-5-20251101": { input: 5.0, output: 25.0 },
  "claude-opus-4-1-20250805": { input: 15.0, output: 75.0 },
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-3-7-sonnet-20250219": { input: 3.0, output: 15.0 },
  "claude-opus-4-20250514": { input: 15.0, output: 75.0 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
};

const GEMINI_PRICING: Record<string, ModelPricing> = {
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-2.0-flash-lite": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, output: 5.0 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-flash-8b": { input: 0.0375, output: 0.15 },
};

const PRICING_TABLES: Record<string, Record<string, ModelPricing>> = {
  openai: OPENAI_PRICING,
  anthropic: ANTHROPIC_PRICING,
  gemini: GEMINI_PRICING,
};

export function calculateCost(
  provider: string,
  model: string,
  tokensIn: number,
  tokensOut: number
): number {
  const table = PRICING_TABLES[provider];
  if (!table) return 0;

  const pricing = table[model];
  if (!pricing) return 0;

  const inputCost = (tokensIn / 1_000_000) * pricing.input;
  const outputCost = (tokensOut / 1_000_000) * pricing.output;

  return Math.round((inputCost + outputCost) * 1e6) / 1e6;
}
