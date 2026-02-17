from typing import Dict, Optional
import requests

_api_key: Optional[str] = None
_endpoint: str = "http://localhost:8080/v1/traces"
_enabled: bool = True


def configure(api_key: str, endpoint: Optional[str] = None):

    # api_key: Your Costrace API key
    # endpoint: Optional custom backend endpoint
    global _api_key, _endpoint
    _api_key = api_key
    if endpoint:
        _endpoint = endpoint


def send_trace(data: Dict) -> bool:
    # this sends the trace to costrace backend
    # this is non-blocking and would not crash the user's application even if the backend is down
    global _api_key, _endpoint, _enabled
    if not _enabled or not _api_key:
        return False

    try:
        response = requests.post(
            _endpoint,
            json=data,
            headers={
                "Authorization": f"Bearer {_api_key}",
                "Content-Type": "application/json",
            },
            timeout=2,
        )

        print(f"[Costrace] Trace sent to {_endpoint} - Status: {response.status_code}")
        if response.status_code not in range(200, 300):
            print(f"[Costrace] Error response: {response.text}")
        return response.status_code in range(200, 300)
    except Exception as e:
        print(f"[Costrace] Failed to send trace: {e}")
        return False


def create_trace(
    provider: str,
    model: str,
    tokens_in: int,
    tokens_out: int,
    latency_ms: int,
    cost_usd: float,
    status: str = "success",
    error: Optional[str] = None,
) -> None:

    trace = {
        "provider": provider,
        "model": model,
        "tokens_in": tokens_in,
        "tokens_out": tokens_out,
        "latency_ms": latency_ms,
        "cost_usd": cost_usd,
        "status": status,
    }

    if error:
        trace["error"] = error

    return trace


if __name__ == "__main__":
    configure(api_key="test_key_123")

    trace = create_trace(
        provider="openai",
        model="gpt-3.5-turbo",
        tokens_in=100,
        tokens_out=200,
        latency_ms=100,
        cost_usd=0.01,
    )
    print("Created trace.")
    print(trace)
    success = send_trace(trace)
    print(f"send successful : {success}")
