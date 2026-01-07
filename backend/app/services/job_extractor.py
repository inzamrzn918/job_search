import json
import asyncio
import threading
from typing import Dict, Any
from playwright.async_api import async_playwright
from google import genai
from ..core.config import GOOGLE_API_KEY, MODEL_ID

client = genai.Client(api_key=GOOGLE_API_KEY)

class JobExtractor:
    async def extract_from_url(self, url: str) -> Dict[str, Any]:
        # On Windows with Uvicorn, the main loop might be a SelectorEventLoop
        # which doesn't support subprocesses (needed by Playwright).
        # We run the playwright part in a separate thread with its own Proactor loop.
        return await asyncio.to_thread(self._extract_sync, url)

    def _extract_sync(self, url: str) -> Dict[str, Any]:
        """Synchronous wrapper to run the async extraction in a new loop."""
        result = {}
        error = None

        def worker():
            nonlocal result, error
            # This will use the ProactorEventLoopPolicy set in app/__init__.py
            new_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(new_loop)
            try:
                result = new_loop.run_until_complete(self._extract_async(url))
            except Exception as e:
                error = e
            finally:
                new_loop.close()

        thread = threading.Thread(target=worker)
        thread.start()
        thread.join()

        if error:
            raise error
        return result

    async def _extract_async(self, url: str) -> Dict[str, Any]:
        """The actual async extraction logic using playwright."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Set a common user agent to avoid some blocks
                await page.set_extra_http_headers({
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
                
                await page.goto(url, wait_until="networkidle", timeout=60000)
                
                # Extract main text content
                text_content = await page.evaluate("() => document.body.innerText")
                
                if not text_content.strip():
                    raise ValueError("Could not extract text from the URL")

                # Use Gemini to extract structured data
                prompt = f"""
                Extract the following information from this job description page and return it as a pure JSON object.
                Do NOT include markdown formatting or explanations. Just the raw JSON content.

                Structure:
                {{
                    "title": "string",
                    "company": "string",
                    "location": "string",
                    "description": "string",
                    "skills": ["string", ...],
                    "responsibilities": ["string", ...],
                    "salary": "string"
                }}

                Job Page Content:
                {text_content[:15000]}
                """

                # Use async client for Gemini
                response = await client.aio.models.generate_content(
                    model=MODEL_ID,
                    contents=prompt
                )
                
                # Clean and parse JSON
                result_text = response.text.replace('```json', '').replace('```', '').strip()
                try:
                    parsed_json = json.loads(result_text)
                except:
                    parsed_json = {"raw_text": result_text}

                return {
                    "url": url,
                    "parsed_data": parsed_json,
                    "raw_text": text_content[:1000]
                }
            
            finally:
                await browser.close()

    async def parse_manual_input(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Extract the following information from this manually provided job description and return it as a pure JSON object.
        Do NOT include markdown formatting or explanations. Just the raw JSON content.

        Structure:
        {{
            "title": "string",
            "company": "string",
            "location": "string",
            "description": "string",
            "skills": ["string", ...],
            "responsibilities": ["string", ...],
            "salary": "string"
        }}

        Job Content:
        {text}
        """
        response = await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=prompt
        )
        
        # Clean and parse JSON
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        try:
            parsed_json = json.loads(result_text)
        except:
            parsed_json = {"raw_text": result_text}

        return {
            "parsed_data": parsed_json,
            "raw_text": text[:500]
        }
