---
name: Multi-source business directory scraper
description: How real businesses are sourced for the CRM hunt feature — no API keys required
---

## Rule
The business hunter in /crm/hunt-businesses runs an 8-source parallel directory scraper (business-scrapers.ts) as the primary approach. Google Places API supplements if env var is set. AI generation is the final fallback only when directories return fewer than half the requested count.

## Sources (all run in parallel)
1. Yelp — JSON-LD + hypernova embedded JSON + window.__YELP_STATE__ + HTML regex
2. Yellow Pages (US/CA domain auto-detected) — HTML card parsing
3. Google Search local pack — JSON-LD + big script block scan + HTML class patterns
4. Manta — HTML article cards (US SMB directory)
5. Hotfrog — country TLD map (com.au, co.uk, ca, co.nz, co.za, in, ie, sg, my, ph, ng)
6. Yell.com — UK only (returns [] for other countries)
7. Foursquare — __NEXT_DATA__ JSON + JSON-LD
8. Bing Local — HTML card parsing

## Email extraction
Each business website is scraped for a real email (main page → /contact → /contact-us → /about).
Directory URLs (yelp.com, manta.com, etc.) are skipped. Runs 5 concurrent.

**Why:** AI-generated leads have invalid emails that bounce. Real scraped businesses have real domains.

**How to apply:** scrapeBusinessDirectories() in artifacts/api-server/src/lib/business-scrapers.ts. Called from hunt-businesses endpoint only — slow due to network I/O.
