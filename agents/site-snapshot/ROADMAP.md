# Site Snapshot - roadmap & changelog

A running log so we can iterate across sessions. Newest first.

## Done

- Copilot Component that renders inline (score card) and fullscreen (dashboard).
- Health score (0-100) with four explained sub-scores.
- Storage vs quota, stale docs, largest files.
- External / "Anyone" sharing, with **critical** flag (Anyone link on a stale doc).
- **Duplicate** detection (Graph `quickXorHash`) with wasted-space totals.
- **File-type breakdown** (Word, Excel, PowerPoint, PDF, images, media, archives, other).
- **Empty files** detection.
- **Deep recursive scan** with paging, across **all user document libraries** (system libraries skipped), bounded by caps.
- **Site by name or URL** (Graph search).
- Actions: **Export CSV**, **Email me this**, **Remove sharing link** (guarded confirm dialog).
- SharePoint **brand theme** (light/dark).
- Card-based dashboard layout with KPI tiles.
- Jest tests for scoring and file-type categorisation.

## Done (design pass 2)

- Compact single summary card; prominent score badge with a "Health score" caption.
- Fifth health factor: **Tidiness** (empty files + duplicate groups). Weights re-balanced to sum to 100.
- KPI tiles: two even rows of six, each with a **corner info icon**; alert tiles turn red.
- **Info tooltips** on the score, every factor and every KPI (plain-language explanations).
- Detail tables now show **Size, Last changed, Created by**, with **pagination** and a **total-size footer**.
- **All UI text moved into a strings file** (loc), registered in config.json.
- Parallel permission checks for a faster sharing scan.

## Next up (proposed)

### File versions (from your feedback)
Graph exposes `/drives/{id}/items/{id}/versions`, but that is one call per file, so it cannot run for every item. Plan: enrich only the **top-N largest files** with version count and total version size, surface a "version bloat" signal (files with many old versions eating storage), and optionally a "trim versions" action. Cheap (≈10 calls) and useful.

### Feature ideas worth adding
- **Reclaimable space** headline = duplicates + empty + stale-media, with a one-click CSV of exactly what to clean.
- **Owner notify**: email the creator/owner of risky shares or big stale files.
- **Sortable columns** (Fluent DataGrid) on the detail tables.
- **Trend over time** (needs stored history - background job).
- **Sharing-link expiry** and guest-age checks.
- **Per-library breakdown** (which library holds the clutter/risk).


### Scale to large sites
A client component cannot enumerate hundreds of thousands of files. Two real paths:
1. **Search aggregations (recommended first step).** Use SharePoint/Graph search to get accurate totals and per-type/size aggregates without enumerating - e.g. total document count, largest files, files by type - then enumerate only the top slice for detail. Fast and honest.
2. **Background job for full coverage.** For a true full crawl, move the scan to an Azure Function or Power Automate flow that writes results to a list/Dataverse; the component reads the last result. This is the only way to cover 100k+ items reliably.

### Multiple sites
- Today the agent analyses one site at a time (by name or URL). Options:
  - Accept a `siteUrls` array in the tool and render a **compare table** (score per site).
  - A "recent sites" picker in the UI.
  - A tenant roll-up (needs a background job + admin scope).

### More useful signals
- Ownership of risky shares (who to notify), and a one-click "notify owner" mail.
- Very large media as a % of storage; "reclaimable space" = duplicates + empty + stale media.
- Sharing links with no expiry; guest access age.
- Trend over time (needs stored history - background job).

### UX
- A score ring/gauge visual; sparklines on KPI tiles.
- Column sort in the detail tables (Fluent DataGrid) and pagination for long lists.
- Configurable stale window / topN from chat (already tool params - expose in UI too).

## Notes / decisions

- **Fluent v9 + MSGraphClientV3** chosen because that is what the SPFx 1.24 scaffold uses and the component context exposes the Graph factories (verified live in the Workbench). No PnPjs.
- **Sample-data fallback** keeps the UI useful before permissions are approved.
- Scan caps: MAX_ITEMS 1000, MAX_FOLDERS 400, PERM_CAP 80.
