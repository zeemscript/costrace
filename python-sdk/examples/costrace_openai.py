# python/test_openai.py - test the openai integration with costrace

from pathlib import Path
import sys

# Add parent directory to path so we can import costrace
sys.path.insert(0, str(Path(__file__).parent.parent))

import costrace
import openai
import os
from dotenv import load_dotenv


current_file_path = Path(__file__).resolve()
env_path = current_file_path.parent.parent.parent / ".env"


load_dotenv(dotenv_path=env_path)

costrace.init(api_key=os.getenv("COSTRACE_API_KEY"))




OPENAI_KEY = os.getenv("OPENAI_KEY")
client = openai.OpenAI(api_key=OPENAI_KEY)

print("Making a real OpenAI call...")
print("This will be tracked by Costrace!\n")

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
