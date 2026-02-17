"""
Pricing data for LLM providers.
Prices are per 1 million tokens (USD).

Last updated: Feb 2025
"""

OPENAI_PRICING = {
    "gpt-5.2": {"input": 1.75, "output": 14.00},
    "gpt-5": {"input": 1.25, "output": 10.00},
    "gpt-5-mini": {"input": 0.25, "output": 2.00},
    "gpt-5-nano": {"input": 0.05, "output": 0.40},
    "o3": {"input": 2.00, "output": 8.00},
    "o3-mini": {"input": 1.10, "output": 4.40},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4.1": {"input": 2.00, "output": 8.00},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4": {"input": 30.00, "output": 60.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
}


def calculate_cost(provider: str, model: str, tokens_in: int, tokens_out: int) -> float:
    if provider == "openai":
        pricing = OPENAI_PRICING.get(model)

        if not pricing:
            return 0.0

        # Calculate cost
        # Formula: (tokens / 1,000,000) * price_per_million_tokens
        input_cost = (tokens_in / 1_000_000) * pricing["input"]
        output_cost = (tokens_out / 1_000_000) * pricing["output"]

        total = input_cost + output_cost
        return round(total, 6)

    # Unknown provider
    return 0.0


if __name__ == "__main__":
    # Test: 1000 input tokens, 500 output tokens with gpt-4o
    cost = calculate_cost("openai", "gpt-4o", 1000, 500)
    print(f"Test cost: ${cost}")
