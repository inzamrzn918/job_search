import asyncio
import httpx
import feedparser
import io

async def test_feed():
    urls = [
        "https://weworkremotely.com/categories/remote-programming-jobs.rss",
        "https://remotive.com/remote-jobs/feed",
        "https://www.workingnomads.com/jobs/rss",
        "https://himalayas.app/jobs/rss" # Added one of the problematic feeds
    ]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    async with httpx.AsyncClient(headers=headers) as client:
        for url in urls:
            print(f"\nFetching {url}...")
            try:
                response = await client.get(url, follow_redirects=True, timeout=10)
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    feed = feedparser.parse(io.BytesIO(response.content))
                    print(f"Found {len(feed.entries)} items.")
                    if feed.entries:
                         print("First item:", feed.entries[0].get('title'))
                    if feed.bozo:
                        print(f"Feedparser warning/error (handled): {feed.bozo_exception}")
                else:
                    print("Failed to fetch.")
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_feed())
