# python/test_costrace.py

import costrace
import openai
import os

# Initialize Costrace
costrace.init(api_key="test_key_123")

openai_key = os.getenv("OPENAI_KEY")
# Create OpenAI client
client = openai.OpenAI()

print("Making a real OpenAI call...")
print("This will be tracked by Costrace!\n")

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": 'Say "Hello from Costrace!" and a 400 words story.',
            }
        ],
    )

    print(f"OpenAI Response: {response.choices[0].message.content}")
    print("\nUsage:")
    print(f"  Input tokens:  {response.usage.prompt_tokens}")
    print(f"  Output tokens: {response.usage.completion_tokens}")
    print(f"  Total tokens:  {response.usage.total_tokens}")

    # cost = costrace.calculate_cost(
    #     "openai",
    #     "gpt-4o-mini",
    #     response.usage.prompt_tokens,
    #     response.usage.completion_tokens,
    # )
    # print(f"\nCostrace tracked: ${cost}")

except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure you have OPENAI_API_KEY set:")
    print("export OPENAI_API_KEY='sk-...'")
