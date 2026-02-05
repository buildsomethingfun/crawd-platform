# CLAUDE.md

Instructions for Claude Code sessions working on this project.

## Project Overview

CRAWD Platform - dashboard for AI agent streaming platform ("Twitch for AI agents"). Streamers register here, get Mux streaming credentials, and manage their profiles.

- **Live:** https://crawd-platform.vercel.app
- **GitHub:** https://github.com/buildsomethingfun/crawd-platform

## Tech Stack

- Next.js 15 (App Router, Turbopack)
- Clerk (auth)
- Drizzle ORM + PostgreSQL (Render.com)
- Mux (streaming infrastructure)
- Tailwind CSS
- Vercel (deployment via GitHub Actions)

## Key Commands

```bash
# Development
pnpm install
pnpm dev

# Database
pnpm drizzle-kit generate  # Generate migrations
pnpm drizzle-kit push      # Push schema to DB (interactive, may need manual SQL)

# Manual DB access (if drizzle-kit is interactive)
PGPASSWORD="<password>" psql -h <host> -U <user> -d <db> -c "SQL HERE"
```

## Deployment

**Auto-deploys on push to `main`** via GitHub Actions → Vercel.

### Adding Vercel Environment Variables

```bash
cd /Users/m/crawd-platform
vercel env add VAR_NAME production <<< "value"
```

### GitHub Secrets (already configured)

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Vercel Env Vars (already configured)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`

## Database

**Host:** Render.com PostgreSQL

Connection string in `.env` (for drizzle-kit) and `.env.local` (for app).

Schema location: `src/db/schema.ts`

### Tables

- `users` - Clerk user ID, email, displayName, bio
- `streams` - name, streamKey, muxLiveStreamId, muxPlaybackId, isLive
- `api_keys` - hashed keys for CLI auth
- `usage_events` - analytics

## Mux Streaming

- RTMP URL: `rtmp://global-live.mux.com:5222/app`
- Stream keys issued per-stream via Mux API
- Playback via Mux Player at `/preview/:playbackId`

Mux client: `src/lib/mux.ts`

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── keys/         # API key management
│   │   ├── streams/      # Stream CRUD (creates Mux live streams)
│   │   └── profile/      # User profile settings
│   ├── dashboard/
│   │   ├── page.tsx      # Overview
│   │   ├── api-keys/     # API keys UI
│   │   ├── streams/      # Streams UI (shows OBS settings)
│   │   └── settings/     # Profile settings UI
│   ├── preview/[playbackId]/ # Public stream viewer
│   ├── sign-in/
│   └── sign-up/
├── db/
│   ├── schema.ts         # Drizzle schema
│   └── index.ts          # DB connection
└── lib/
    ├── mux.ts            # Mux client
    └── api-key.ts        # Key generation utils
```

## Conventions

- Use `type` not `interface` (unless implementing a class)
- Use pnpm
- Phosphor icons: add `-Icon` suffix (e.g., `AppleLogoIcon`)
- Buttons: only un-hover transitions, hover transition should be none
