import httpx
import feedparser
from typing import List, Dict, Any, Optional
import asyncio
import io
import random
from datetime import datetime
from time import mktime
import csv
import os

class JobSearchService:
    # Resolving path relative to this file (backend/app/services/job_search.py)
    # Target: backend/data/job_data_set.csv
    # ../../data/job_data_set.csv
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    CSV_PATH = os.path.join(BASE_DIR, "data", "job_data_set.csv")

    def __init__(self):
        self.feed_data = []
        self._load_csv_data()

    def _load_csv_data(self):
        try:
            if not os.path.exists(self.CSV_PATH):
                print(f"CSV file not found at {self.CSV_PATH}")
                return

            with open(self.CSV_PATH, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.feed_data.append(row)
            print(f"Loaded {len(self.feed_data)} feeds from CSV.")
        except Exception as e:
            print(f"Error loading CSV data: {e}")

    def get_available_filters(self) -> Dict[str, List[str]]:
        """Returns unique values for filter dropdowns"""
        countries = set()
        domains = set()
        work_types = set()
        
        for row in self.feed_data:
            if row.get('country'): countries.add(row['country'])
            if row.get('job_domain'): domains.add(row['job_domain'])
            if row.get('work_type'): work_types.add(row['work_type'])
            
        return {
            "countries": sorted(list(countries)),
            "domains": sorted(list(domains)),
            "work_types": sorted(list(work_types))
        }

    def _select_feeds(self, query: str = "", country: str = None, domain: str = None, work_type: str = None, source: str = None) -> List[str]:
        """Selects relevant RSS feed URLs based on filters"""
        selected_feeds = []
        
        # Normalize inputs
        n_country = country.lower() if country and country != "Any" else None
        n_domain = domain.lower() if domain and domain != "Any" else None
        n_work_type = work_type.lower() if work_type and work_type != "Any" else None
        n_source = source.lower() if source else None
        
        # Blocked / Rate-limited domains to ignore
        BLOCKED_DOMAINS = ["indeed.com", "glassdoor.com", "linkedin.com"]

        for row in self.feed_data:
            # Skip blocked domains
            if any(d in row.get('url', '').lower() for d in BLOCKED_DOMAINS):
                continue

            # Filter by Country
            if n_country and row.get('country') and row['country'].lower() != n_country:
                continue
                
            # Filter by Domain
            if n_domain and row.get('job_domain') and row['job_domain'].lower() != n_domain:
                continue
                
            # Filter by Work Type
            if n_work_type and row.get('work_type') and row['work_type'].lower() != n_work_type:
                continue
                
            # Filter by Source (optional exact match)
            if n_source and row.get('source') and n_source not in row['source'].lower():
                continue

            # Optional: rudimentary keyword matching if no strict filters but query exists
            if not (n_country or n_domain or n_work_type) and query:
                q_lower = query.lower()
                feed_keywords = (row.get('keyword') or "").lower()
                feed_name = (row.get('name') or "").lower()
                # If query matches keyword or name, prioritize it
                if q_lower in feed_keywords or q_lower in feed_name:
                    selected_feeds.append(row['url'])
                    continue # Added to avoid double add, though set at end handles it
                
                # If query does NOT match, do we exclude it? 
                # For now, if user gave a Query but NO filters, we only want relevant feeds.
                # So if we are here, it didn't match. Skip it.
                # BUT, this logic means searches like "react" might miss general feeds that *contain* react jobs.
                # Let's be less strict: if query exists, we still allow General feeds.
                if 'general' in (row.get('job_domain') or '').lower():
                     selected_feeds.append(row['url'])
                     continue

            # If strictly filtering by metadata, add it.
            if n_country or n_domain or n_work_type:
                selected_feeds.append(row['url'])
        
        # KEY FIX: If we have a query (e.g. "Python"), we MUST also search the big general boards (WWR, Remotive)
        # because the specific "Python" feeds in the CSV might be broken/stale.
        # The big boards definitely have Python jobs.
        if query:
             reliable_general_keywords = ["weworkremotely", "remotive", "remoteok"]
             for row in self.feed_data:
                 url = row.get('url', '').lower()
                 # If it's a reliable source and looks like a general/main feed (not a niche category that might be empty)
                 # largely just check if it's from the reliable list. 
                 # We'll rely on the fact that we dedup later.
                 if any(k in url for k in reliable_general_keywords):
                     # Add it to the list. 
                     # (Optional: prefer 'General' domain if we want to be picky, but let's be broad for now)
                     if row.get('job_domain') == 'General' or 'all' in url or 'remote-jobs' in url:
                         selected_feeds.append(row['url'])
        
        # If no feeds match, fall back to reliable top feeds
        if not selected_feeds:
            # Fallback: Prioritize known reliable sources
            reliable_keywords = ["weworkremotely", "remotive", "jobspresso", "remoteok"]
            fallback = []
            for row in self.feed_data:
                url = row.get('url', '').lower()
                if any(k in url for k in reliable_keywords):
                    fallback.append(row['url'])
                    if len(fallback) >= 10:
                        break
            
            # If still nothing (unlikely), take any
            if not fallback:
                 fallback = [r['url'] for r in self.feed_data if r.get('url')][:10]
            
            return fallback
            
        return list(set(selected_feeds)) # Dedupe

    async def search_remote_jobs(
        self, 
        query: str, 
        limit: int = 50, 
        skip: int = 0,
        country: str = None,
        domain: str = None,
        work_type: str = None,
        source: str = None
    ) -> List[Dict[str, Any]]:
        """
        Fetches jobs from dynamically selected RSS feeds.
        """
        jobs = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        # Select feeds dynamically
        target_urls = self._select_feeds(query, country, domain, work_type, source)
        
        # Prioritize reliable feeds to avoid filling the batch with broken/blocked URLs
        reliable_keywords = ["weworkremotely", "remotive", "jobspresso", "remoteok"]
        priority_feeds = []
        other_feeds = []
        
        for url in target_urls:
            if any(k in url.lower() for k in reliable_keywords):
                priority_feeds.append(url)
            else:
                other_feeds.append(url)
        
        # Shuffle only the others to ensure variety, but keep priority ones at top
        random.shuffle(other_feeds)
        
        # Combine: always check priority feeds first, then fill remaining slots with others
        feeds_to_fetch = (priority_feeds + other_feeds)[:10]

        print(f"Searching {len(feeds_to_fetch)} feeds for query='{query}' filters={{country={country}, domain={domain}}}")
        # print(f"Feeds: {feeds_to_fetch}")

        sem = asyncio.Semaphore(5)

        async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
            async def safe_fetch(url):
                async with sem:
                    return await self._fetch_feed(client, url)

            tasks = [safe_fetch(url) for url in feeds_to_fetch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for res in results:
                if isinstance(res, list):
                    jobs.extend(res)

        # Filter by Query Content (client-side filtering after fetch)
        query_lower = query.lower()
        filtered_jobs = [
            job for job in jobs 
            if query_lower in job['title'].lower() or query_lower in job['company'].lower() or query_lower in job['description'].lower()
        ]
        
        # Sort by date (newest first)
        filtered_jobs.sort(key=lambda x: x.get('_sort_date', 0), reverse=True)
        
        return filtered_jobs[skip : skip + limit]

    async def _fetch_feed(self, client: httpx.AsyncClient, url: str) -> List[Dict[str, Any]]:
        try:
            response = await client.get(url, timeout=10.0) 
            response.raise_for_status()
            
            # Dynamic source detection logic (simplified)
            domain = url.split("//")[-1].split("/")[0].replace("www.", "")
            source_name = domain.split(".")[0].capitalize()
            
            if "weworkremotely" in url: source_name = "WeWorkRemotely"
            elif "remotive" in url: source_name = "Remotive"
            elif "workingnomads" in url: source_name = "WorkingNomads"
            elif "remoteok" in url: source_name = "RemoteOK"
            elif "stackoverflow" in url: source_name = "StackOverflow"
            elif "github" in url: source_name = "GitHub"
            elif "indeed" in url: source_name = "Indeed"

            return self._parse_rss(response.text, source_name)
        except Exception as e:
            print(f"Error fetching feed {url}: {e}") 
            return []

    def _parse_rss(self, xml_content: str, source: str) -> List[Dict[str, Any]]:
        jobs = []
        try:
            feed = feedparser.parse(io.BytesIO(xml_content.encode('utf-8')))
            
            if not feed.entries:
                print(f"Warning: No entries found for {source}")

            for entry in feed.entries:
                title = entry.get('title', 'Unknown Role')
                link = entry.get('link', '')
                description = entry.get('summary', '') or entry.get('description', '')
                pub_date_str = entry.get('published', '') or entry.get('updated', '')
                
                # Try to parse date for sorting
                sort_date = 0.0
                if entry.get('published_parsed'):
                     sort_date = mktime(entry.published_parsed)
                elif entry.get('updated_parsed'):
                     sort_date = mktime(entry.updated_parsed)
                
                # Company extraction attempts
                company = "Unknown Company"
                if 'author' in entry:
                     company = entry.author
                
                if source == "WeWorkRemotely" and ":" in title:
                    parts = title.split(":", 1)
                    company = parts[0].strip()
                    title = parts[1].strip()
                elif source == "Remotive" and " at " in title:
                       parts = title.split(" at ")
                       company = parts[-1].strip()
                       title = " at ".join(parts[:-1]).strip()
                
                jobs.append({
                    "title": title,
                    "company": company,
                    "location": "Remote", # Default, ideally parsed from feed or CSV
                    "url": link,
                    "description": description,
                    "posted_date": pub_date_str,
                    "source": source,
                    "_sort_date": sort_date
                })
        except Exception as e:
            print(f"Error parsing RSS for {source}: {e}")
        return jobs
