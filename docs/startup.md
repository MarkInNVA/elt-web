# Startup

Light web client for the elt-aws lake (same contract as [elt-ios](https://github.com/MarkInNVA/elt-ios); see [platform.md](https://github.com/MarkInNVA/elt-ios/blob/main/docs/platform.md)).

## Prerequisites

- Node.js 22+ (LTS recommended)
- npm 10+

## 1. Install

```bash
cd elt-web
npm install
cp .env.example .env
```

Edit `.env` if you need a non-production API:

```bash
# Local elt-pipeline / combined uvicorn
VITE_API_URL=http://127.0.0.1:8788
```

Production default (when unset) is the deployed `ApiUrl` from the EltAws stack.

## 2. Run dev server

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The browser calls the API directly; CORS is enabled on API Gateway.

## 3. Verify

```bash
npm test
npm run build
```

## 4. Production build

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (GitHub Pages, Cloudflare Pages, S3 + CloudFront). Set `VITE_API_URL` at **build time** to the target API.

## Scope (do not widen without server changes)

- S&P 500, P/S, ≥ $500k, exclude 10b5-1
- Windows 7 / 14 / 30 ending on the catalog edition filing day (23:50 America/New_York)
- `POST /v1/preview` (one section per request) and `POST /v1/transactions`

Keep `src/core/lakeScope.ts` aligned with elt-ios `LakeScope.swift` and `elt_pipeline.preview.editions`.

## Related repos

- [elt-ios](https://github.com/MarkInNVA/elt-ios) — SwiftUI light client
- [elt-aws](https://github.com/MarkInNVA/elt-aws) — API + ingest
- [elt-pipeline](https://github.com/MarkInNVA/elt-pipeline) — lake queries
