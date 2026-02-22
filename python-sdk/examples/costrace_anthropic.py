# python/costrace/examples/costrace_anthropic.py - test the anthropic integration with costrace

from pathlib import Path
import sys
import anthropic

# Add parent directory to path so we can import costrace
sys.path.insert(0, str(Path(__file__).parent.parent))

import costrace

import os
from dotenv import load_dotenv

# costrace.init(api_key="ct_74f3eaea682f1b43817976e4efbc73f08ff16624f9ba9e9415550393efd36b06")


current_file_path = Path(__file__).resolve()
env_path = current_file_path.parent.parent.parent / ".env"


_ = load_dotenv(dotenv_path=env_path)

costrace.init(api_key=os.getenv("COSTRACE_API_KEY"))

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")

print("Anthropic API Key loaded:", bool(ANTHROPIC_KEY))
client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

print("Making a real Anthropic call...")
print("This will be tracked by Costrace!\n")

try:
    # models = ["claude-3-5-sonnet-20241022", "claude-"]
    models = [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-5-20250929",
        "claude-sonnet-4-20250514",
    ]

    for model in models:
        response = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": 'Say "Hello from Costrace!" and write a 300 word story.',
                }
            ],
        )

        print(f"Model: {model}")
        print(f"Anthropic Response: {response.content[0].text}")
        print("\nUsage:")
        print(f"  Input tokens:  {response.usage.input_tokens}")
        print(f"  Output tokens: {response.usage.output_tokens}")
        print(
            f"  Total tokens:  {response.usage.input_tokens + response.usage.output_tokens}"
        )
        print("\n" + "=" * 80 + "\n")


except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure you have ANTHROPIC_API_KEY set:")
    print("export ANTHROPIC_API_KEY='sk-ant-...'")
