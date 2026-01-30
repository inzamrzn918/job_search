import httpx
import logging
logger = logging.getLogger(__name__)
import feedparser
from typing import List, Dict, Any, Optional
import asyncio
import io
import random
from datetime import datetime
from time import mktime
import csv
import os
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_, desc
from ..models.models import JobFeed, JobPosting, JobPostingMatch, Resume, User

class JobSearchService:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    CSV_PATH = os.path.join(BASE_DIR, "data", "job_data_set.csv")

    def __init__(self):
        self.feed_data = []
        self._load_csv_data()

    def _load_csv_data(self):
        try:
            if not os.path.exists(self.CSV_PATH):
                return
            with open(self.CSV_PATH, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.feed_data.append(row)
        except Exception as e:
            print(f"Error loading CSV data: {e}")

    # --- DB SYNC & SCORING METHODS ---

    async def initialize_feeds_from_csv(self, db: AsyncSession):
        """Migrate CSV feeds to DB if DB is empty"""
        result = await db.execute(select(JobFeed).limit(1))
        if result.scalar():
            return # Already initialized

        print("Initializing JobFeeds from CSV...")
        for row in self.feed_data:
            if not row.get('url'): continue
            stmt = select(JobFeed).where(JobFeed.url == row['url'])
            existing = await db.execute(stmt)
            if not existing.scalar():
                new_feed = JobFeed(
                    name=row.get('name') or row.get('source') or "Unknown Feed",
                    url=row['url'],
                    is_active=True
                )
                db.add(new_feed)
        await db.commit()



    async def sync_feeds_to_db(self, db: AsyncSession):
        """Fetch all active feeds and save new jobs to DB"""
        logger.info("Starting Feed Sync...")
        result = await db.execute(select(JobFeed).where(JobFeed.is_active == True))
        feeds = result.scalars().all()
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }
        
        sem = asyncio.Semaphore(5)
        all_parsed_jobs = []

        async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
            async def fetch_feed(feed):
                async with sem:
                    try:
                        resp = await client.get(feed.url, timeout=15.0)
                        resp.raise_for_status()
                        fetched = self._parse_rss(resp.text, feed.name or "Unknown")
                        # Add feed metadata
                        for j in fetched: j['_feed_source'] = feed.name
                        
                        feed.last_fetched = datetime.utcnow()
                        return fetched
                    except Exception as e:
                        logger.warning(f"Failed to sync feed {feed.url}: {e}")
                        return []

            results = await asyncio.gather(*[fetch_feed(f) for f in feeds])
            for res in results:
                all_parsed_jobs.extend(res)

        # Deduplicate
        unique_jobs = {}
        for j in all_parsed_jobs:
            job_hash = hashlib.md5(j['url'].encode()).hexdigest()
            if job_hash not in unique_jobs:
                j['external_id'] = job_hash
                unique_jobs[job_hash] = j
        
        # Batch check against DB
        new_jobs_count = 0
        job_hashes = list(unique_jobs.keys())
        
        # Process in chunks to avoid SQL limits
        chunk_size = 500
        for i in range(0, len(job_hashes), chunk_size):
            chunk = job_hashes[i:i + chunk_size]
            existing_res = await db.execute(select(JobPosting.external_id).where(JobPosting.external_id.in_(chunk)))
            existing_ids = set(r[0] for r in existing_res.all())
            
            to_insert = [unique_jobs[hid] for hid in chunk if hid not in existing_ids]
            
            for j in to_insert:
                 new_posting = JobPosting(
                    external_id=j['external_id'],
                    url=j['url'],
                    title=j['title'],
                    company=j['company'],
                    location=j['location'],
                    description=j['description'],
                    source=j.get('_feed_source') or j['source'],
                    posted_date=datetime.now(), 
                    is_active=True
                )
                 db.add(new_posting)
            
            new_jobs_count += len(to_insert)

        await db.commit()
        logger.info(f"Sync complete. Added {new_jobs_count} new jobs.")

    async def score_jobs_for_user(self, db: AsyncSession, user_id: int):
        """Calculate match scores for unscored jobs for a user"""
        # Get latest resume
        res_stmt = select(Resume).where(Resume.user_id == user_id).order_by(desc(Resume.created_at)).limit(1)
        resume = (await db.execute(res_stmt)).scalar_one_or_none()
        
        if not resume:
            return

        # Get unscored jobs (Simplified: check recent active jobs)
        recent_jobs = await db.execute(
            select(JobPosting)
            .where(JobPosting.is_active == True)
            .where(JobPosting.deleted_at == None)
            .order_by(desc(JobPosting.created_at))
            .limit(100)
        )
        jobs = recent_jobs.scalars().all()
        
        for job in jobs:
            # Check if match exists
            match_exist = await db.execute(
                select(JobPostingMatch).where(
                    and_(JobPostingMatch.job_posting_id == job.id, JobPostingMatch.user_id == user_id)
                )
            )
            if match_exist.scalar():
                continue

            # Calculate Mock Score
            score = self._calculate_mock_score(resume.raw_text, job.description or job.title)
            
            match = JobPostingMatch(
                job_posting_id=job.id,
                resume_id=resume.id,
                user_id=user_id,
                score=score,
                match_details={"justification": "Keyword analysis"}
            )
            db.add(match)
        
        await db.commit()

    def _calculate_mock_score(self, resume_text: str, job_text: str) -> float:
        if not resume_text or not job_text: return 0.0
        r_tokens = set(resume_text.lower().split())
        j_tokens = set(job_text.lower().split())
        overlap = r_tokens.intersection(j_tokens)
        if not j_tokens: return 0.0
        return min(100.0, (len(overlap) / len(j_tokens)) * 100 * 5) 

    async def search_db_jobs(self, db: AsyncSession, user_id: int, query: str = "", limit: int = 50, skip: int = 0, filters: dict = None):
        """Query DB for jobs with matches"""
        stmt = select(JobPosting, JobPostingMatch).outerjoin(
            JobPostingMatch, 
            and_(JobPostingMatch.job_posting_id == JobPosting.id, JobPostingMatch.user_id == user_id)
        ).where(
            JobPosting.is_active == True,
            JobPosting.deleted_at == None
        )

        if query:
            stmt = stmt.where(or_(
                JobPosting.title.ilike(f"%{query}%"),
                JobPosting.description.ilike(f"%{query}%"),
                JobPosting.company.ilike(f"%{query}%")
            ))
            
        if filters and filters.get('country'):
             stmt = stmt.where(JobPosting.location.ilike(f"%{filters['country']}%"))
        
        # Order by Score desc, then Date desc
        stmt = stmt.order_by(desc(JobPostingMatch.score), desc(JobPosting.posted_date))
        stmt = stmt.offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        return [
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description,
                "url": job.url,
                "source": job.source,
                "posted_date": job.posted_date,
                "match_score": match.score if match else 0,
                "match_details": match.match_details if match else None
            }
            for job, match in rows
        ]
        
    async def soft_delete_job(self, db: AsyncSession, job_id: int):
        stmt = update(JobPosting).where(JobPosting.id == job_id).values(deleted_at=datetime.utcnow())
        await db.execute(stmt)
        await db.commit()

    # --- LEGACY / HELPER METHODS ---

    def get_available_filters(self) -> Dict[str, List[str]]:
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
        selected_feeds = []
        n_country = country.lower() if country and country != "Any" else None
        n_domain = domain.lower() if domain and domain != "Any" else None
        n_source = source.lower() if source else None
        
        BLOCKED_DOMAINS = ["indeed.com", "glassdoor.com", "linkedin.com"]

        for row in self.feed_data:
            if any(d in row.get('url', '').lower() for d in BLOCKED_DOMAINS): continue
            
            if n_country and row.get('country') and row['country'].lower() != n_country: continue
            if n_domain and row.get('job_domain') and row['job_domain'].lower() != n_domain: continue
            if n_source and row.get('source') and n_source not in row['source'].lower(): continue

            # If strictly filtering by metadata, add it.
            if n_country or n_domain:
                selected_feeds.append(row['url'])

        # KEY FIX: If query, always include reliable general feeds
        if query:
             reliable_general_keywords = ["weworkremotely", "remotive", "remoteok"]
             for row in self.feed_data:
                 url = row.get('url', '').lower()
                 if any(k in url for k in reliable_general_keywords):
                     selected_feeds.append(row['url'])
        
        # Fallback
        if not selected_feeds:
            reliable_keywords = ["weworkremotely", "remotive", "jobspresso", "remoteok"]
            fallback = []
            for row in self.feed_data:
                url = row.get('url', '').lower()
                if any(k in url for k in reliable_keywords):
                    fallback.append(row['url'])
                    if len(fallback) >= 10: break
            if not fallback:
                 fallback = [r['url'] for r in self.feed_data if r.get('url')][:10]
            return fallback
            
        return list(set(selected_feeds))

    async def search_remote_jobs(self, query: str, limit: int = 50, skip: int = 0, country: str = None, domain: str = None, work_type: str = None, source: str = None) -> List[Dict[str, Any]]:
        jobs = []
        headers = {"User-Agent": "Mozilla/5.0"}
        target_urls = self._select_feeds(query, country, domain, work_type, source)
        
        reliable_keywords = ["weworkremotely", "remotive", "jobspresso", "remoteok"]
        priority_feeds = []
        other_feeds = []
        for url in target_urls:
            if any(k in url.lower() for k in reliable_keywords): priority_feeds.append(url)
            else: other_feeds.append(url)
        
        random.shuffle(other_feeds)
        feeds_to_fetch = (priority_feeds + other_feeds)[:10]

        sem = asyncio.Semaphore(5)
        async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
            async def safe_fetch(url):
                async with sem:
                    return await self._fetch_feed(client, url)
            tasks = [safe_fetch(url) for url in feeds_to_fetch]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, list): jobs.extend(res)

        filtered_jobs = [j for j in jobs if query.lower() in j['title'].lower() or query.lower() in j['description'].lower()]
        filtered_jobs.sort(key=lambda x: x.get('_sort_date', 0), reverse=True)
        return filtered_jobs[skip : skip + limit]

    async def _fetch_feed(self, client: httpx.AsyncClient, url: str) -> List[Dict[str, Any]]:
        try:
            response = await client.get(url, timeout=15.0) 
            response.raise_for_status()
            
            domain = url.split("//")[-1].split("/")[0].replace("www.", "")
            source_name = domain.split(".")[0].capitalize()
            if "weworkremotely" in url: source_name = "WeWorkRemotely"
            elif "remotive" in url: source_name = "Remotive"
            
            return self._parse_rss(response.text, source_name)
        except Exception:
            return []

    def _parse_rss(self, xml_content: str, source: str) -> List[Dict[str, Any]]:
        jobs = []
        try:
            feed = feedparser.parse(io.BytesIO(xml_content.encode('utf-8')))
            for entry in feed.entries:
                title = entry.get('title', 'Unknown Role')
                link = entry.get('link', '')
                description = entry.get('summary', '') or entry.get('description', '')
                pub_date_str = entry.get('published', '') or entry.get('updated', '')
                
                sort_date = 0.0
                if entry.get('published_parsed'): sort_date = mktime(entry.published_parsed)
                elif entry.get('updated_parsed'): sort_date = mktime(entry.updated_parsed)
                
                company = "Unknown Company"
                if 'author' in entry: company = entry.author
                
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
                    "location": "Remote",
                    "url": link,
                    "description": description,
                    "posted_date": pub_date_str,
                    "source": source,
                    "_sort_date": sort_date
                })
        except Exception:
            pass
        return jobs
