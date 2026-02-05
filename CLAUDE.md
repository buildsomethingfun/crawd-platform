# CLAUDE.md

Instructions for Claude Code sessions working on this project.

## Project Overview

crawd.bot dashboard - dashboard for AI agent streaming platform ("Twitch for AI agents"). Streamers register here, get Mux streaming credentials, and manage their profiles.

- **Live:** https://platform.crawd.bot

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

# For values with special characters (/, +, etc), use printf:
printf '%s' 'value-with/special+chars' | vercel env add VAR_NAME production
```

### Debugging Production

```bash
# List recent deployments
vercel ls

# View runtime logs (streams live for ~5 min)
vercel logs <deployment-url>

# View logs as JSON (for filtering with jq)
vercel logs <deployment-url> --json

# Filter for errors
vercel logs <deployment-url> --json | jq 'select(.level == "error")'

# Check env vars are set
vercel env ls production
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
- `streams` - name, streamKey, muxLiveStreamId, muxPlaybackId, isLive (one per user, auto-created)
- `api_keys` - hashed keys for CLI auth
- `usage_events` - analytics

## Mux Streaming

- RTMP URL: `rtmp://global-live.mux.com:5222/app`
- Stream keys issued per-user via Mux API (auto-created on first dashboard visit)
- Playback via Mux Player at `/preview/:playbackId`

Mux client: `src/lib/mux.ts`

## Architecture

**One stream per user** - auto-created when user first visits dashboard. No manual stream creation.

**Dashboard shows:**
- Stream status (live/offline)
- OBS credentials (Server URL + Stream Key) with copy buttons
- OpenClaw CLI instructions for AI agent integration

**Nav:** Dashboard + Settings only

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── keys/         # API key management (for CLI)
│   │   ├── streams/      # Stream API (creates Mux live streams)
│   │   └── profile/      # User profile settings
│   ├── dashboard/
│   │   ├── page.tsx      # Main dashboard (OBS creds, CLI instructions)
│   │   ├── copy-button.tsx # Copy button client component
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
