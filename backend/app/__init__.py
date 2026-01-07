import asyncio
import sys

if sys.platform == "win32":
    try:
        if not isinstance(asyncio.get_event_loop_policy(), asyncio.WindowsProactorEventLoopPolicy):
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
            print("DEBUG: app/__init__.py - Set WindowsProactorEventLoopPolicy")
    except Exception as e:
        print(f"DEBUG: app/__init__.py - Error: {e}")
