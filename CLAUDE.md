@AGENTS.md

# IdeaHub UPM

Team project for Agile Methods for Software Development (EMSE, UPM, 2026-27), Team 4. A web app where UPM
students publish their ideas and investors find them. The professor, Ana Moreno, is the Product Owner and
accepts or rejects each user story in the sprint demos.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind). Next.js 16 renamed `middleware.ts` to `proxy.ts`.
- Supabase for the database and auth. Clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts`
  (server). `proxy.ts` refreshes the session and must not force sign-in: visitors browse without an account.
- Vercel hosting: every push to `main` deploys.
- Keys live in `.env.local` (gitignored, template in `.env.example`). Never commit real keys.

## Services

| Service | Where |
|---|---|
| GitHub | `aronerh/ideahub-upm` |
| Supabase | project `ideahub-upm`, ref `dfkofftpkhxwllavpgwh` (eu-west-1). Ignore the other, paused project. |
| Vercel | team `idea-hub-upm` (`team_Wh6FvgnGQUW98ycVt3RqFzEe`), project `ideahub-upm` (`prj_qXnKwDjwHfnelTybkRULAlcmDuVe`). Live: https://ideahub-upm.vercel.app. Preview URLs need a Vercel login (Standard Protection); the production URL is public. Env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set for production and preview. |
| Jira | project `IH` |

The Supabase advisor flags `public.rls_auto_enable()` (Supabase's own event trigger for "RLS on by default").
It's harmless: an event trigger function can't be called through the API.

## Backlog (Jira project `IH`)

Epics follow the Lean UX hypotheses: H1 Publishing, H2 Visibility, H3 Feedback.

**Sprint 1: 23 Oct to 6 Nov 2026, goal "Test H1: will students publish their ideas?"** (11 points)

| Key | Story | Acceptance criteria |
|---|---|---|
| IH-10 | Student submits an idea with a 5-field form (5 pts) | Fields: title (max 80), one-line pitch (max 140), problem, solution, team members. All required; an empty field shows an error and nothing is saved. Only signed-in students can open the form. After submitting, the student lands on the idea's page. |
| IH-11 | Visitor browses published ideas (3 pts) | List shows title, pitch and date, newest first. Clicking opens the idea page with all 5 fields. Works without signing in. Empty state when there are no ideas. |
| IH-12 | Student signs up with a UPM email (3 pts) | Anyone can sign up, but only `@alumnos.upm.es` and `@upm.es` addresses can publish; others rejected when publishing with a clear message. Sign in and sign out. Visitors can browse but not publish. |
| IH-20 | Experiment story | 5 classmates publish an idea on the live app; time them (goal under 5 min) and ask "Would you use this for your own idea?" |
| IH-8 / IH-9 | Setup / put the app online | Done when the app runs locally and on Vercel. |

Demos: 30 Oct (Sprint 1 Part 1, working MVP) and 6 Nov (experiment results, retrospective).

## How we work

- One branch per Jira item, named after its key (`IH-10-idea-form`); the key goes in commit messages.
- Pull request plus a review by someone else before merging into `main`.
- Database changes go in `supabase/migrations/NNN_name.sql` so the team can see them in GitHub. Every table
  gets Row Level Security policies in the same migration (RLS is on by default for new tables).
- AI assistants: read-only on the Supabase project unless asked to change it, and confirm before applying a
  migration. Don't start coding a story unless asked.
