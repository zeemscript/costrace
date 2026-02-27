# costrace

Node.js SDK for tracking cost, token usage, and latency of LLM API calls. Works by monkey-patching supported LLM client libraries so existing code requires no changes.

## Supported Providers

- **OpenAI** — `openai` package (gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano, o3, o4-mini, gpt-4o, gpt-4o-mini, gpt-4.1, gpt-4-turbo, gpt-4, gpt-3.5-turbo)
- **Anthropic** — `@anthropic-ai/sdk` package (claude-opus-4-6, claude-sonnet-4-6, claude-sonnet-4-5, claude-haiku-4-5, and older variants)
- **Google Gemini** — `@google/genai` package (gemini-2.0-flash, gemini-2.0-flash-lite, gemini-1.5-pro, gemini-1.5-flash, gemini-1.5-flash-8b)

## Install

```bash
npm install costrace
```

## Usage

Call `init()` once at startup. After that, use your LLM SDKs as normal — all calls are automatically tracked.

```typescript
import * as costrace from "costrace";
import OpenAI from "openai";

costrace.init(process.env.COSTRACE_API_KEY);

const openai = new OpenAI();
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }],
});
```

Works the same way with Anthropic and Gemini:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});
```

```typescript
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await genai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Hello",
});
```

## What Gets Tracked

Each LLM call sends a trace to the Costrace backend containing:

- Provider and model name
- Input and output token counts
- Latency in milliseconds
- Calculated cost in USD
- Success/error status

Traces are sent as fire-and-forget HTTP requests in the background — they don't block your application.

## Configuration

```typescript
// Required: your Costrace API key
costrace.init(apiKey);

// Optional: custom backend endpoint
costrace.init(apiKey, "https://your-endpoint.com/v1/traces");
```

## License

MIT
