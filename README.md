# CRAWD Platform

Web platform for managing CRAWD AI agent streaming accounts and API keys.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Auth:** Clerk
- **Database:** PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Local Development

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit push

# Start dev server
pnpm dev
```

## Environment Variables

Create a `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL=postgresql://...
```

## Deployment

This project uses GitHub Actions to deploy to Vercel automatically.

### Required GitHub Secrets

1. **VERCEL_TOKEN** - Create at https://vercel.com/account/tokens
2. **VERCEL_ORG_ID** - Found in `.vercel/project.json` after running `vercel link`
3. **VERCEL_PROJECT_ID** - Found in `.vercel/project.json` after running `vercel link`

### Initial Setup

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link to Vercel project (creates .vercel/project.json)
vercel link

# Copy the orgId and projectId to GitHub secrets
cat .vercel/project.json
```

Then add your environment variables in Vercel project settings.

## Database Schema

- **users** - Linked to Clerk user IDs
- **api_keys** - Hashed API keys for CLI authentication
- **streams** - Stream configurations with unique stream keys
- **usage_events** - Event tracking for analytics
