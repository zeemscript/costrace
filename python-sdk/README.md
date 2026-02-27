# costrace

Python SDK for tracking cost, token usage, and latency of LLM API calls. Works by monkey-patching supported LLM client libraries so existing code requires no changes.

## Supported Providers

- **OpenAI** — `openai` package (gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano, o3, o4-mini, gpt-4o, gpt-4o-mini, gpt-4.1, gpt-4-turbo, gpt-4, gpt-3.5-turbo)
- **Anthropic** — `anthropic` package (claude-opus-4-6, claude-sonnet-4-6, claude-sonnet-4-5, claude-haiku-4-5, and older variants)
- **Google Gemini** — `google-genai` package (gemini-2.0-flash, gemini-2.0-flash-lite, gemini-1.5-pro, gemini-1.5-flash, gemini-1.5-flash-8b)

## Install

Install with the provider(s) you use:

```bash
pip install costrace-sdk[openai]       # OpenAI only
pip install costrace-sdk[anthropic]    # Anthropic only
pip install costrace-sdk[gemini]       # Gemini only
pip install costrace-sdk[all]          # all providers
```

## Usage

Call `init()` once at startup. After that, use your LLM SDKs as normal — all calls are automatically tracked.

```python
import costrace
import openai

costrace.init(api_key="your-costrace-api-key")

client = openai.OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

Works the same way with Anthropic and Gemini:

```python
import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
```

```python
from google import genai

client = genai.Client(api_key="your-gemini-key")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Hello",
)
```

## What Gets Tracked

Each LLM call sends a trace to the Costrace backend containing:

- Provider and model name
- Input and output token counts
- Latency in milliseconds
- Calculated cost in USD
- Success/error status

Traces are sent in a background thread — they don't block your application.

## Configuration

```python
# Required: your Costrace API key
costrace.init(api_key="your-key")

# Optional: custom backend endpoint
costrace.init(api_key="your-key", endpoint="https://your-endpoint.com/v1/traces")
```

## License

MIT
