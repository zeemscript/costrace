from typing import Dict
import threading
import requests

_api_key: str | None = None
_endpoint: str = "http://localhost:8080/v1/traces"
_enabled: bool = True


def configure(api_key: str, endpoint: str | None = None):

    # api_key: Your Costrace API key
    # endpoint: Optional custom backend endpoint
    global _api_key, _endpoint
    _api_key = api_key
    if endpoint:
        _endpoint = endpoint


def _do_send(data: Dict, api_key: str, endpoint: str):
    try:
        response = requests.post(
            endpoint,
            json=data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=5,
        )
        if response.status_code not in range(200, 300):
            print(f"[Costrace] Error response: {response.text}")
    except Exception as e:
        print(f"[Costrace] Failed to send trace: {e}")


def send_trace(data: Dict) -> bool:
    global _api_key, _endpoint, _enabled
    if not _enabled or not _api_key:
        return False

    t = threading.Thread(target=_do_send, args=(data, _api_key, _endpoint), daemon=True)
    t.start()
    return True


def create_trace(
    provider: str,
    api_key: str,  # use this to identify where the trace came from
    model: str,
    tokens_in: int,
    tokens_out: int,
    latency_ms: int,
    cost_usd: float,
    status: str = "success",
    error: str | None = None,
) -> dict:

    trace = {
        "provider": provider,
        "model": model,
        "tokens_in": tokens_in,
        "api_key": api_key,
        "tokens_out": tokens_out,
        "latency_ms": latency_ms,
        "cost_usd": cost_usd,
        "status": status,
    }

    if error:
        trace["error"] = error

    return trace
