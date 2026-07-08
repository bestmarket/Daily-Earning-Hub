---
name: Public Report System
description: How the website analysis report feature works — DB table, API routes, email injection, frontend page, admin tab.
---

# Public Report System

## Architecture
- DB table: `websiteReportsTable` in `lib/db/src/schema/automation.ts`
- API routes: `artifacts/api-server/src/routes/reports.ts` (registered in index.ts)
- Frontend page: `artifacts/agency-site/src/pages/Report.tsx` at route `/report/:reportId`
- Admin tab: `ReportAnalyticsTab` component in Admin.tsx, polling `/api/reports/admin/notifications` every 30s

## Key rules
- `createReport()` and `buildReportEmailSection()` exported from `routes/reports.ts` — import them in automation.ts and crm-ai.ts
- `buildReportEmailSection` HTML-escapes businessName and validates reportUrl scheme (http/https only)
- Status allowlist: `active | proposal_sent | client_replied | won` enforced in PATCH endpoint
- Report creation always wrapped in try/catch — NEVER blocks email flow
- Public endpoint guards: `reportId === "admin"` check prevents route collision

## Environment
- `AGENCY_URL` env var controls the base URL for report links in emails (e.g. `https://youragency.com`)
- Falls back to: Replit dev domain → API server host (production usually same domain)
- In dev: report links in emails point to API server host — set AGENCY_URL to agency-site URL for correct links

**Why:** Report links need to reach the frontend (agency-site) not the API server. In production they're typically the same domain. In dev they're different ports.
