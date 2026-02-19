# python/examples/costrace_gemini.py - test the gemini integration with costrace

from pathlib import Path
import sys

# Add parent directory to path so we can import costrace
sys.path.insert(0, str(Path(__file__).parent.parent))

import costrace
from google import genai
import os
from dotenv import load_dotenv

costrace.init(api_key="ct_test_iafdpiohweroidsonirewoienodoadioi")

current_file_path = Path(__file__).resolve()
env_path = current_file_path.parent.parent.parent / ".env"


load_dotenv(dotenv_path=env_path)


GEMINI_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_KEY)

print("Making a real Gemini call...")
print("This will be tracked by Costrace!\n")

# First, list available models
print("Listing available models...")
try:
    available_models = client.models.list()
    print("Available models:")
    for model in available_models:
        print(f"  - {model.name}")
    print()
except Exception as e:
    print(f"Error listing models: {e}\n")

try:
    models = ["models/gemini-2.5-flash", "models/gemini-2.5-pro", "models/gemini-2.0-pro"]
    for model in models:
        response = client.models.generate_content(
            model=model,
            contents='Say "Hello from Costrace!" and write a 300 word story.',
        )

        print(f"Model: {model}")
        print(f"Gemini Response: {response.text}")
        print("\nUsage:")
        print(f"  Input tokens:  {response.usage_metadata.prompt_token_count}")
        print(f"  Output tokens: {response.usage_metadata.candidates_token_count}")
        print(f"  Total tokens:  {response.usage_metadata.total_token_count}")
        print("\n" + "="*80 + "\n")


except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure you have GEMINI_API_KEY set:")
    print("export GEMINI_API_KEY='...'")
