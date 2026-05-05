# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sunsetzhong Email (S-MAIL) — a self-contained email system: Cloudflare Worker backend + SPA frontend + Android TWA app. Users get `@sunsetzhong.indevs.in` addresses, send via Resend API, receive via Cloudflare Email Workers, with PWA push notifications.

## Commands

```bash
npm run dev          # Start local dev server (wrangler dev)
npm run deploy       # Bump version, sync version strings, then deploy to Cloudflare
npm run version:bump # Bump minor version in VERSION file + sync to sw.js, index.ts, build.gradle
```

## Architecture

### Backend (`src/index.ts`)

Everything lives in a single monolithic file — ~427 lines covering the full API surface. Built on **Hono** (v4) running on Cloudflare Workers with D1 (SQLite) for persistence.

**Module entrypoint** (default export):
- `fetch(request, env, ctx)` — HTTP handler. On cold start, calls `bootstrap()` to ensure tables exist + create bootstrap admin user (from `BOOTSTRAP_USERNAME`/`BOOTSTRAP_PASSWORD` secrets). Routes API calls to Hono app; everything else falls through to Cloudflare Assets (SPA).
- `email(message, env, ctx)` — Cloudflare Email Workers handler for inbound mail. Parses MIME (multipart, quoted-printable, base64), resolves recipient to owner via `user_addresses` table, stores in `emails` table, sends Web Push notification.

**Auth flow**:
- Session-based: cookie `em_session` contains a random token; hashed with `AUTH_SALT:session:<token>` and matched against `sessions` table. 30-day expiry.
- Device token: bearer token for Android background service, hashed with `AUTH_SALT:device:<token>` against `device_tokens` table.
- First registered user becomes `admin`; subsequent users are `user`.

**Key API routes**:
- `POST /api/auth/register`, `/login`, `/logout`, `GET /api/auth/me`, `POST /api/auth/password`
- `POST /api/auth/device-key`, `DELETE /api/auth/device-key`
- `GET /api/inbox`, `/api/sent`, `/api/mail/:id`; `POST /api/send`, `/api/reply`; `DELETE /api/mail/:id`
- `GET /api/contacts` — recent outbound recipients
- `GET/POST/DELETE /api/addresses` — temp email addresses (admin-configurable limit via `max_temp_addresses`)
- `GET /api/settings/public`, `GET/POST /api/admin/settings` — system settings CRUD
- `GET /api/push/vapid-public-key`, `POST /api/push/subscribe`, `/api/push/unsubscribe`
- `GET /api/version`

**Email sending**: Uses Resend API (`api.resend.com`). The `SENDER_DOMAIN` env var determines the from-address domain. Outbound messages are stored locally before the API call.

**Push notifications**: Full Web Push implementation (RFC 8291) with VAPID. VAPID keys auto-generated on first use and persisted in `system_settings`. The service worker polls `/api/inbox` every 30s and also listens for server push events.

### Database (D1, migrations in `migrations/`)

Run in order: `0001_emails.sql` → `0002_auth.sql` → `0003_owner.sql` → `0004_features.sql` → `0005_push.sql`

Tables: `emails`, `users`, `sessions`, `device_tokens`, `user_addresses`, `addresses`, `system_settings`, `push_subscriptions`.

`src/index.ts` `bootstrap()` also creates `push_subscriptions` and `device_tokens` tables via `CREATE TABLE IF NOT EXISTS` as a safety net.

### Frontend

- `public/index.html` — the SPA (main app shell + client-side routing, ~50KB single file)
- `public/sw.js` — service worker: caching, offline fallback, inbox polling, push event handling, update detection
- `public/manifest.json` — PWA manifest (name: "Sunsetzhong Email", short: "S-MAIL")
- `public/offline.html` — offline fallback page
- `public/app.apk` — downloadable Android APK
- `public/.well-known/assetlinks.json` — Android Digital Asset Links for TWA

Login (`/login`) and register (`/register`) pages are server-rendered HTML embedded in `src/index.ts` as template literals.

### Android App (`apk/EmailApp/`)

A Trusted Web Activity (TWA) wrapping the PWA. Package: `in.indevs.sunsetzhong.email`. Built with Gradle. Version code = `major * 100 + minor` (e.g., version 2.8 → versionCode 208).

### Versioning

`VERSION` file holds `major.minor`. On deploy, `bump-version.js` increments minor, then `sync-version.js` propagates the version string to:
- `public/sw.js` (`const VERSION = "..."`)
- `src/index.ts` (`/api/version` response)
- `apk/EmailApp/app/build.gradle` (`versionCode` and `versionName`)

### Secrets / Environment

Set via `npx wrangler secret put`:
- `RESEND_KEY` — Resend API key for outbound email
- `DS_TOKEN` — DeepSeek API token (for donation payment feature)
- `AUTH_SALT` — salt for session/device token hashing
- `BOOTSTRAP_USERNAME` / `BOOTSTRAP_PASSWORD` — auto-created admin user on first deploy

Static vars in `wrangler.toml`:
- `SENDER_DOMAIN` = `sunsetzhong.indevs.in`
- `DB` binding → D1 database `sunsetzhong-email-db`
- `ASSETS` binding → `./public` directory
