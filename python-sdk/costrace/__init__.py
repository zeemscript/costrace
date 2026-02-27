from typing import Callable
from .pricing import calculate_cost
from .tracker import configure, create_trace, send_trace


__version__ = "0.1.0"

__all__ = ["init", "calculate_cost"]


def init(api_key: str, endpoint: str | None = None):
    configure(api_key=api_key, endpoint=endpoint)

    try:
        _patch_openai(api_key)
    except ImportError:
        pass

    try:
        _patch_anthropic(api_key)
    except ImportError:
        pass

    try:
        _patch_gemini(api_key)
    except ImportError:
        pass


# ── OpenAI ────────────────────────────────────────────────────────────────────


def _patch_openai(api_key: str):
    import openai

    if hasattr(openai, "OpenAI"):
        _patch_openai_v1(api_key)
    elif hasattr(openai, "ChatCompletion"):
        _patch_openai_legacy(api_key)
    else:
        return


def _patch_openai_v1(api_key: str):
    import openai

    _original_init = openai.OpenAI.__init__

    def wrapped_init(self, *args, **kwargs):
        _original_init(self, *args, **kwargs)

        original_create = self.chat.completions.create

        def tracked_create(*create_args, **create_kwargs) -> Callable:
            return _track_completion(
                original_create, api_key, *create_args, **create_kwargs
            )

        self.chat.completions.create = tracked_create

    openai.OpenAI.__init__ = wrapped_init


def _patch_openai_legacy(api_key: str):
    import openai

    _original_create = openai.ChatCompletion.create

    def tracked_create(*args, **kwargs):
        return _track_completion(_original_create, api_key, *args, **kwargs)

    openai.ChatCompletion.create = tracked_create


def _track_completion(original_func, api_key: str, *args, **kwargs):
    import time

    start_time = time.time()
    model = kwargs.get("model", "unknown")

    try:
        response = original_func(*args, **kwargs)
        latency_ms = int((time.time() - start_time) * 1000)

        tokens_in = (
            getattr(response.usage, "prompt_tokens", 0)
            if hasattr(response, "usage")
            else 0
        )
        tokens_out = (
            getattr(response.usage, "completion_tokens", 0)
            if hasattr(response, "usage")
            else 0
        )

        cost_usd = calculate_cost("openai", model, tokens_in, tokens_out)

        trace = create_trace(
            provider="openai",
            model=model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            status="success",
            api_key=api_key,
        )
        send_trace(trace)
        return response

    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        trace = create_trace(
            provider="openai",
            model=model,
            tokens_in=0,
            tokens_out=0,
            latency_ms=latency_ms,
            cost_usd=0.0,
            api_key=api_key,
            status="error",
            error=str(e),
        )
        send_trace(trace)
        raise


# ── Anthropic ─────────────────────────────────────────────────────────────────


def _patch_anthropic(api_key: str):
    import anthropic

    _original_init = anthropic.Anthropic.__init__

    def wrapped_init(self, *args, **kwargs):
        _original_init(self, *args, **kwargs)

        original_create = self.messages.create

        def tracked_create(*create_args, **create_kwargs):
            return _track_anthropic_completion(
                original_create, api_key, *create_args, **create_kwargs
            )

        self.messages.create = tracked_create

    anthropic.Anthropic.__init__ = wrapped_init


def _track_anthropic_completion(original_func, api_key: str, *args, **kwargs):
    import time

    start_time = time.time()
    model = kwargs.get("model", "unknown")

    try:
        response = original_func(*args, **kwargs)
        latency_ms = int((time.time() - start_time) * 1000)

        tokens_in = (
            getattr(response.usage, "input_tokens", 0)
            if hasattr(response, "usage")
            else 0
        )
        tokens_out = (
            getattr(response.usage, "output_tokens", 0)
            if hasattr(response, "usage")
            else 0
        )

        cost_usd = calculate_cost("anthropic", model, tokens_in, tokens_out)

        trace = create_trace(
            provider="anthropic",
            model=model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            status="success",
            api_key=api_key,
        )
        send_trace(trace)
        return response

    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        trace = create_trace(
            provider="anthropic",
            model=model,
            tokens_in=0,
            tokens_out=0,
            cost_usd=0.0,
            latency_ms=latency_ms,
            status="error",
            api_key=api_key,
            error=str(e),
        )
        send_trace(trace)
        raise


# ── Gemini ────────────────────────────────────────────────────────────────────


def _patch_gemini(api_key: str):
    from google import genai

    _original_init = genai.Client.__init__

    def wrapped_init(self, *args, **kwargs):
        _original_init(self, *args, **kwargs)

        original_generate = self.models.generate_content

        def tracked_generate(*gen_args, **gen_kwargs):
            return _track_gemini_completion(
                original_generate, api_key, *gen_args, **gen_kwargs
            )

        self.models.generate_content = tracked_generate

    genai.Client.__init__ = wrapped_init


def _track_gemini_completion(original_func, api_key: str, *args, **kwargs):
    import time

    start_time = time.time()

    model = kwargs.get("model", args[0] if args else "unknown")
    # normalize "models/gemini-2.0-flash" -> "gemini-2.0-flash"
    if isinstance(model, str) and model.startswith("models/"):
        model = model[len("models/") :]

    try:
        response = original_func(*args, **kwargs)
        latency_ms = int((time.time() - start_time) * 1000)

        usage = getattr(response, "usage_metadata", None)
        tokens_in = getattr(usage, "prompt_token_count", 0) if usage else 0
        tokens_out = getattr(usage, "candidates_token_count", 0) if usage else 0

        cost_usd = calculate_cost("gemini", model, tokens_in, tokens_out)

        trace = create_trace(
            provider="gemini",
            model=model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            status="success",
            api_key=api_key,
        )
        send_trace(trace)
        return response

    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        trace = create_trace(
            provider="gemini",
            model=model,
            tokens_in=0,
            tokens_out=0,
            cost_usd=0.0,
            latency_ms=latency_ms,
            status="error",
            api_key=api_key,
            error=str(e),
        )
        send_trace(trace)
        raise
