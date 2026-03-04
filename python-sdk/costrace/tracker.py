from typing import Dict, List, Optional
import atexit
import logging
import threading
import requests

logger = logging.getLogger("costrace")

_api_key: Optional[str] = None
_endpoint = "https://api.costrace.dev/v1/traces"
_enabled: bool = True
_pending_threads: List[threading.Thread] = []
_lock = threading.Lock()


def _flush():
    with _lock:
        threads = list(_pending_threads)
        _pending_threads.clear()
    for t in threads:
        t.join(timeout=10)


atexit.register(_flush)


def configure(api_key: str, endpoint: Optional[str] = None):

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
            logger.warning("Error response: %s", response.text)
    except Exception as e:
        logger.warning("Failed to send trace: %s", e)


def send_trace(data: Dict) -> bool:
    global _api_key, _endpoint, _enabled
    if not _enabled or not _api_key:
        return False

    t = threading.Thread(target=_do_send, args=(data, _api_key, _endpoint))
    t.start()
    with _lock:
        _pending_threads.append(t)
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
    error: Optional[str] = None,
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
