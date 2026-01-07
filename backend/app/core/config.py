import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_ID = 'gemini-flash-latest'

# For Playwright on Windows
import sys
import asyncio

def setup_asyncio():
    if sys.platform == 'win32':
        try:
            # Check if it's already a ProactorEventLoopPolicy
            if not isinstance(asyncio.get_event_loop_policy(), asyncio.WindowsProactorEventLoopPolicy):
                asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
                print("DEBUG: Set WindowsProactorEventLoopPolicy")
        except Exception as e:
            print(f"DEBUG: Failed to set ProactorEventLoopPolicy: {e}")
