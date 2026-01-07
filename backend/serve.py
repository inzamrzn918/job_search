import asyncio
import sys
import uvicorn

def main():
    if sys.platform == 'win32':
        # Force ProactorEventLoop for Playwright
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        print(f"INFO: WindowsProactorEventLoopPolicy enforced. Policy: {type(asyncio.get_event_loop_policy()).__name__}")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
        loop="asyncio"
    )

if __name__ == "__main__":
    main()
