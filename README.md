# IdeaHub UPM

Where UPM student ideas meet investors. Agile Methods for Software Development (EMSE, UPM), Team 4.

Stack: [Next.js 16](https://nextjs.org) (App Router, TypeScript, Tailwind), [Supabase](https://supabase.com)
(database and auth) and [Vercel](https://vercel.com) (hosting). Backlog and sprints are in Jira (project `IH`).

## Run it locally

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable key
   (ask in the group chat, or Supabase: Project Settings → API). Never commit `.env.local`.
4. `npm run dev` and open http://localhost:3000

## Where things go

| Path | What |
|---|---|
| `app/` | Pages and layouts (one folder per route) |
| `lib/supabase/client.ts` | Supabase client for Client Components |
| `lib/supabase/server.ts` | Supabase client for Server Components and Server Actions |
| `proxy.ts`, `lib/supabase/proxy.ts` | Keeps users signed in (refreshes the session on each request) |

## Working together

- One branch per Jira item, named after its key: `IH-10-idea-form`.
- Put the key in commit messages (`IH-10 add form validation`) so Jira links them.
- Open a pull request and let someone else review it before merging into `main`.
  Every push to `main` deploys to Vercel automatically.
- Next.js 16 changed a lot. If you use an AI assistant, `AGENTS.md` tells it to read the bundled docs first.
