from typing import Optional
from .pricing import calculate_cost
from .tracker import configure, create_trace, send_trace


__version__ = "0.1.0"

__all__ = ["init", "calculate_cost"]


def init(api_key: str, endpoint: Optional[str] = None):
    configure(api_key=api_key, endpoint=endpoint)
    # we try to autopatch if open ai is enabled
    try:
        print("[Costrace] openai detected - enabling autotracking")
        _patch_openai()

    except ImportError:
        print("[Costrace] openai not detected - install to enable autotracking")


def _patch_openai():
    import openai

    if hasattr(openai, "OpenAI"):
        # OpenAI SDK v1.0+
        _patch_openai_v1()
    elif hasattr(openai, "ChatCompletion"):
        # Legacy OpenAI SDK
        _patch_openai_legacy()
    else:
        print("[Costrace] Unknown OpenAI SDK version - auto tracking disabled")


def _patch_openai_v1():
    import openai

    _original_init = openai.OpenAI.__init__

    def wrapped_init(self, *args, **kwargs):
        _original_init(self, *args, **kwargs)

        original_create = self.chat.completions.create

        def tracked_create(*create_args, **create_kwargs):
            return _track_completion(original_create, *create_args, **create_kwargs)

        self.chat.completions.create = tracked_create

    openai.OpenAI.__init__ = wrapped_init
    print("[Costrace] Patched OpenAI SDK v1.0+")


def _patch_openai_legacy():
    import openai

    _original_create = openai.ChatCompletion.create

    def tracked_create(*args, **kwargs):
        return _track_completion(_original_create, *args, **kwargs)

    openai.ChatCompletion.create = tracked_create
    print("[Costrace] Patched OpenAI SDK legacy")


def _track_completion(original_func, *args, **kwargs):
    import time

    start_time = time.time()

    model = kwargs.get("model", "unknown")

    try:
        response = original_func(*args, **kwargs)

        # calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Extract token usage
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

        # calculate cost
        cost_usd = calculate_cost("openai", model, tokens_in, tokens_out)

        trace = create_trace(
            provider="openai",
            model=model,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            status="success",
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
            status="error",
            error=str(e),
        )

        send_trace(trace)

        raise
