---
name: Multi-source business directory scraper
description: How real businesses are sourced for the CRM hunt feature — no API keys required
---

## Rule
The business hunter in /crm/hunt-businesses runs a 15-source parallel directory scraper (business-scrapers.ts) as the primary approach. Google Places API supplements if env var is set. AI-generated fallback businesses were removed entirely (2026-07-04) — they always fail the MX/DNS verification step below since their emails/domains are fabricated, so they silently produced zero usable leads while padding "total" counts, especially at high requested counts where real sources fall short.

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

**Why:** AI-generated leads have invalid emails that bounce, and get filtered to zero by verifyEmailMx/verifyWebsiteDomain in crm-ai.ts — real scraped businesses have real domains.

**How to apply:** scrapeBusinessDirectories() in artifacts/api-server/src/lib/business-scrapers.ts. Called from hunt-businesses endpoint only — slow due to network I/O. Many free directory sites (Yelp, Manta, Hotfrog, TripAdvisor, Cylex, Bark) return 403/429 from cloud/datacenter IPs, so real result volume from a hosted environment is inherently limited without a paid Google Places key — this is a source-availability limit, not a code bug.

## Related fix
filterLiveProspects() in crm-ai.ts previously ran unbounded `Promise.all` over every prospect's MX + domain DNS lookups. Node's libuv threadpool defaults to 4 threads, so large batches (100+) queued past their own 5s timeout and reported false-negative "dead" for nearly everything. Fixed by batching at concurrency 8 and setting `UV_THREADPOOL_SIZE=32` on the api-server start script.
