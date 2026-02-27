from openai import OpenAI
import costrace

costrace.init(
    api_key="ct_c0169bcb138e53e9f0b6ae1c6cb8260be2899e5b2d0af7554739fe05f1297e45",
)
client = OpenAI(
    api_key="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",
)


try:
    models = ["gpt-5-mini", "gpt-4.1-mini", "gpt-3.5-turbo", "gpt-5", "gpt-5.2"]
    for model in models:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": 'Say "Hello from Costrace!" and a 100 words story.',
                }
            ],
        )

        print(f"OpenAI Response: {response.choices[0].message.content}")
        print("\nUsage:")
        print(f"  Input tokens:  {response.usage.prompt_tokens}")
        print(f"  Output tokens: {response.usage.completion_tokens}")
        print(f"  Total tokens:  {response.usage.total_tokens}")

except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure you have OPENAI_API_KEY set:")
    print("export OPENAI_API_KEY='sk-...'")
