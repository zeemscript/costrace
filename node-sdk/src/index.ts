import { calculateCost } from "./pricing.js";
import { configure, createTrace, sendTrace } from "./tracker.js";

export { calculateCost } from "./pricing.js";
export type { TraceData } from "./tracker.js";

/**
 * Initialize Costrace. Call this once at the top of your application.
 *
 * It will automatically patch any installed LLM SDKs (OpenAI, Anthropic, Gemini)
 * so that every call is tracked.
 *
 * @param apiKey - Your Costrace API key
 * @param endpoint - Optional custom backend endpoint
 */
export function init(apiKey: string, endpoint?: string): void {
  configure(apiKey, endpoint);

  _patchOpenAI(apiKey);
  _patchAnthropic(apiKey);
  _patchGemini(apiKey);
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

function _patchOpenAI(apiKey: string): void {
  try {
    const openaiModule = require("openai");
    const OpenAI = openaiModule.default || openaiModule.OpenAI || openaiModule;

    // Patch create() on the Completions prototype directly.
    // This works regardless of import order because all instances
    // share the same prototype.
    const Completions = OpenAI?.Chat?.Completions;
    if (!Completions?.prototype?.create) {
      return;
    }

    const originalCreate = Completions.prototype.create;
    Completions.prototype.create = function (this: any, ...args: any[]): any {
      return _trackOpenAICompletion(originalCreate.bind(this), apiKey, ...args);
    };
  } catch {
    // openai not installed — skip
  }
}

async function _trackOpenAICompletion(
  originalFn: Function,
  apiKey: string,
  ...args: any[]
): Promise<any> {
  const start = Date.now();
  const model: string = args[0]?.model ?? "unknown";

  try {
    const response = await originalFn(...args);
    const latencyMs = Date.now() - start;

    const tokensIn = response?.usage?.prompt_tokens ?? 0;
    const tokensOut = response?.usage?.completion_tokens ?? 0;
    const costUsd = calculateCost("openai", model, tokensIn, tokensOut);

    const trace = createTrace({
      provider: "openai",
      model,
      tokensIn,
      tokensOut,
      costUsd,
      latencyMs,
      status: "success",
      apiKey,
    });
    sendTrace(trace);

    return response;
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const trace = createTrace({
      provider: "openai",
      model,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
      latencyMs,
      status: "error",
      apiKey,
      error: String(err),
    });
    sendTrace(trace);
    throw err;
  }
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

function _patchAnthropic(apiKey: string): void {
  try {
    const anthropicModule = require("@anthropic-ai/sdk");
    const Anthropic =
      anthropicModule.default || anthropicModule.Anthropic || anthropicModule;

    // Patch create() on the Messages prototype directly.
    const Messages = Anthropic?.Messages;
    if (!Messages?.prototype?.create) {
      return;
    }

    const originalCreate = Messages.prototype.create;
    Messages.prototype.create = function (this: any, ...args: any[]): any {
      return _trackAnthropicCompletion(
        originalCreate.bind(this),
        apiKey,
        ...args,
      );
    };
  } catch {
    // anthropic not installed — skip
  }
}

async function _trackAnthropicCompletion(
  originalFn: Function,
  apiKey: string,
  ...args: any[]
): Promise<any> {
  const start = Date.now();
  const model: string = args[0]?.model ?? "unknown";

  try {
    const response = await originalFn(...args);
    const latencyMs = Date.now() - start;

    const tokensIn = response?.usage?.input_tokens ?? 0;
    const tokensOut = response?.usage?.output_tokens ?? 0;
    const costUsd = calculateCost("anthropic", model, tokensIn, tokensOut);

    const trace = createTrace({
      provider: "anthropic",
      model,
      tokensIn,
      tokensOut,
      costUsd,
      latencyMs,
      status: "success",
      apiKey,
    });
    sendTrace(trace);

    return response;
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const trace = createTrace({
      provider: "anthropic",
      model,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
      latencyMs,
      status: "error",
      apiKey,
      error: String(err),
    });
    sendTrace(trace);
    throw err;
  }
}

// ── Gemini ────────────────────────────────────────────────────────────────────

function _patchGemini(apiKey: string): void {
  try {
    const genaiModule = require("@google/genai");
    const Models = genaiModule.Models;

    if (!Models?.prototype?.generateContentInternal) {
      return;
    }

    // Gemini's generateContent is an instance arrow function that delegates
    // to generateContentInternal on the prototype. Patching the prototype
    // method works for all instances regardless of import order.
    const originalGenerate = Models.prototype.generateContentInternal;
    Models.prototype.generateContentInternal = async function (
      this: any,
      ...args: any[]
    ): Promise<any> {
      return _trackGeminiCompletion(
        originalGenerate.bind(this),
        apiKey,
        ...args,
      );
    };
  } catch {
    // @google/genai not installed — skip
  }
}

async function _trackGeminiCompletion(
  originalFn: Function,
  apiKey: string,
  ...args: any[]
): Promise<any> {
  const start = Date.now();

  let model: string = args[0]?.model ?? "unknown";
  if (typeof model === "string" && model.startsWith("models/")) {
    model = model.slice("models/".length);
  }

  try {
    const response = await originalFn(...args);
    const latencyMs = Date.now() - start;

    const usage = response?.usageMetadata;
    const tokensIn = usage?.promptTokenCount ?? 0;
    const tokensOut = usage?.candidatesTokenCount ?? 0;
    const costUsd = calculateCost("gemini", model, tokensIn, tokensOut);

    const trace = createTrace({
      provider: "gemini",
      model,
      tokensIn,
      tokensOut,
      costUsd,
      latencyMs,
      status: "success",
      apiKey,
    });
    sendTrace(trace);

    return response;
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const trace = createTrace({
      provider: "gemini",
      model: typeof model === "string" ? model : "unknown",
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
      latencyMs,
      status: "error",
      apiKey,
      error: String(err),
    });
    sendTrace(trace);
    throw err;
  }
}
