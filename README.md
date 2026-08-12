# Stuff

Turn any social post into a shopping list.

Stuff is a mobile shopping utility: send a post from Instagram, TikTok,
YouTube, Pinterest, Facebook, or the web to Stuff, and it identifies the
products shown, finds places to buy them, and lets you save them into
Boards for later.

This repository is being built incrementally, one development stage at a
time — see the project context for the full roadmap. This README will grow
alongside the app.

## Stack

- [Expo](https://expo.dev) (React Native) + TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for navigation
- [Supabase](https://supabase.com) (Postgres, Auth, Storage, Edge Functions) — client connected; schema/auth land in later stages
- RevenueCat for subscriptions — added in a later stage

## Getting started

```bash
npm install
npm run start
```

This currently runs fine in Expo Go. Pinned to **Expo SDK 54** specifically
so it matches what the published Expo Go app on the App Store supports —
scan the QR code from `npm run start` with your phone's Camera app (Expo Go
must be installed). Native functionality (e.g. the Share Extension for
receiving content from other apps) will require moving to an Expo
Development Build later in the roadmap — see `app.json` / the project
context for details.

### Scripts

| Script              | Description                                  |
| -------------------- | --------------------------------------------- |
| `npm run start`      | Start the Expo dev server                     |
| `npm run ios`        | Start and open in the iOS simulator           |
| `npm run android`    | Start and open in an Android emulator         |
| `npm run web`        | Start the web build                           |
| `npm run typecheck`  | Run the TypeScript compiler with no emit      |
| `npm run lint`       | Run ESLint                                    |

### Environment variables

Copy `.env.example` to `.env` for local configuration. Client-exposed
variables must be prefixed `EXPO_PUBLIC_`. Secrets (AI provider keys,
Supabase service-role keys, etc.) never live in the mobile app — they stay
server-side in Supabase Edge Functions.

`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` come from your
**development** Supabase project (Settings → API in the dashboard). The
anon key is meant to be public — it's only usable through tables protected
by Row Level Security. Restart `expo start` after editing `.env`.

## Supabase

`services/supabase.ts` creates the Supabase client (`@supabase/supabase-js`
+ AsyncStorage for session persistence, plus `AppState`-driven token
auto-refresh so it pauses while backgrounded). If
`EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` aren't set, the client still
initializes (against a placeholder URL) rather than crashing the app —
`isSupabaseConfigured` tells callers whether it's actually usable.

`hooks/useSupabaseConnection.ts` pings the project's Auth health endpoint
(with the required `apikey` header) to confirm the app is actually
reaching your Supabase project. It's no longer surfaced in the UI now
that real authentication proves connectivity end-to-end, but the hook
still exists as a standalone diagnostic if needed.

### Database schema

`supabase/migrations/` has the SQL — see `supabase/README.md` for what's
in it and how to apply it (no CLI project link yet, so it's currently a
paste-into-the-SQL-Editor workflow). `profiles`, `finds`, `products`,
`boards`, `board_products` — every table has Row Level Security enabled,
and `types/database.ts` mirrors the schema for the app code.

This has been tested against a real (throwaway, local) Postgres instance,
including adversarially: a second simulated user was confirmed unable to
read, spoof, overwrite, or link against a first user's data through any
of the five tables. It has **not** yet been applied to the actual
development Supabase project — that's a manual step for you to run (see
`supabase/README.md`).

## Authentication

Real Supabase email/password auth — not mocked:

- `services/auth.ts` — thin wrappers over `supabase.auth`: `signUpWithEmail`,
  `signInWithEmail`, `signOut`.
- `hooks/useAuth.tsx` — `AuthProvider` (wraps the whole app in
  `app/_layout.tsx`) + `useAuth()`, exposing the current `Session | null`
  and an `initializing` flag for the first session read.
- **Profile** tab is the real UI: a sign-in/sign-up form (toggleable) when
  signed out, account email + sign-out when signed in.

Not yet done: Sign in with Apple / Google (need a Development Build —
native modules Expo Go can't run), password reset.

## Boards

Real, fully wired to the schema from Stage 7 — nothing mocked:

- `services/boards.ts` — `listBoards`, `getBoard`, `createBoard`,
  `renameBoard`, `deleteBoard`. Typed end to end via `supabase.from(...)`
  against `types/database.ts`'s `Database` generic (see below).
- `hooks/useBoards.ts` — fetch + loading/error state + `refresh()`.
- **Boards** tab: sign-in gate (Boards are private), loading state, error
  state with retry, empty state, and a real 2-column grid once you have
  Boards. Refetches on tab focus (`useFocusEffect`) rather than needing
  manual refresh signaling.
- `app/boards/new.tsx` — create modal.
- `app/boards/[id]/index.tsx` — detail screen (Rename and Delete
  actions; product list is still empty here — saving a *specific*
  product to a Board isn't wired up yet, see Import below).
- `app/boards/[id]/rename.tsx` — rename modal.

Duplicate board names (per user, case-insensitive) are rejected by the
database's unique constraint; the UI catches that specific Postgres error
code and shows "You already have a Board with that name" rather than a
raw database error.

`supabase.ts`'s client is `createClient<Database>(...)` — Supabase calls
are type-checked against the real schema (row shape, insertable/updatable
columns), not `any`.

## Import & AI product extraction

Real end to end — paste content in, AI extraction, an editable draft
review, then a real save. Nothing here is mocked, but the scope is
deliberately narrower than the full spec right now:

- **What works**: paste a caption/description (copy-pasted by the user
  from the post) + an optional source link → `supabase/functions/
  analyze-find` (OpenAI, structured JSON output) extracts candidate
  products → you review and edit every field before anything is saved →
  saving creates a real `finds` row + `products` rows.
- **What doesn't exist yet**: auto-fetching/scraping the pasted URL
  (Instagram/TikTok/etc. actively block naive server-side fetches —
  building that now would mean shipping something that silently fails
  for most real posts, so it's not built rather than built badly),
  screenshot import, video import, and saving an individual product to a
  specific Board from the Find detail screen.
- Extracted products are saved with `match_type: 'mentioned'` — they
  came from the creator's own caption text, not a confirmed retailer
  match, so a stronger classification (`exact_match`/`likely_match`)
  would be false precision. That's earned later, by Product Search.
- The Edge Function requires a real signed-in user's JWT (checked inside
  the function itself, not just a valid API key) — it costs money per
  call, so anonymous access is a hard no. Verified by actually running
  the function locally with Deno and confirming: missing auth header →
  401, invalid session → 401, missing `OPENAI_API_KEY` → 500 with a
  clear message.
- **Not yet deployed to your Supabase project** — see
  `supabase/README.md` for the one-time `supabase functions deploy` +
  `supabase secrets set OPENAI_API_KEY` steps.

## Navigation

Primary structure is a tab navigator: **Finds | Boards | + | Search | Profile**.

- `app/(tabs)/` — Finds, Boards and Profile are real; Search is still a
  placeholder empty state.
- Finds tab lists real `finds` (`app/finds/[id]/index.tsx` for detail +
  products) — see Import & AI product extraction above for how they get
  there.
- The **+** tab is an action, not a screen: it's intercepted in
  `app/(tabs)/_layout.tsx` and pushes `app/import.tsx`, presented as a
  modal over the tabs — the real import flow (see above).

## Design system

`components/` holds the UI foundations every screen is built on:

| Component         | Purpose                                              |
| ------------------ | ----------------------------------------------------- |
| `theme`             | Design tokens: `colors`, `spacing`, `radii`, `typography` |
| `AppText`           | Typography — `variant`: heading/title/body/label/subtitle/caption |
| `AppButton`         | Buttons — `variant`: primary/secondary/ghost, plus `loading`/`disabled` |
| `Input`             | Labeled text input with an `error` state              |
| `Card`              | Generic surface container                             |
| `Icon`              | Wraps `@expo/vector-icons` so screens don't depend on that package directly |
| `LoadingIndicator`  | Spinner with an optional label                        |
| `ScreenContainer`   | Safe-area-aware screen root with consistent background/padding |

Import from the barrel: `import { AppText, ScreenContainer } from '@/components'`.

Every screen (`app/(tabs)/*`, `app/import.tsx`, `app/boards/*`,
`app/finds/*`) is built on these — there are no raw `View`/`Text` screen
roots or hardcoded colors left in `app/`. All seven components now have
real call sites: `Card` (Boards grid, Find products), `Input` (sign-in,
Board name, Import form), `LoadingIndicator` (every async screen).

No dark mode yet — not asked for — but because screens read colors from
`theme` rather than hardcoding hex values, adding it later is a token
change, not a rewrite.

## Project structure

```
app/            Expo Router routes (screens, layouts). File-based — the
                folder structure here is the navigation structure.
components/     Reusable UI building blocks with no feature-specific
                logic — the design system. See "Design system" above.
features/       Feature-specific code grouped by domain (finds, boards,
                products, ...), each owning its own components/hooks/logic.
                Populated once a feature has real logic to hold, starting
                with the Core Stuff Library stage.
services/       Integrations and business logic that talk to the outside
                world — Supabase client, API clients, provider
                abstractions (ImportService, ProductSearchProvider, ...).
                Populated in the Supabase Integration stage onward.
hooks/          Shared React hooks not tied to one feature.
types/          Shared TypeScript types used across the app.
constants/      Plain app-wide constants (non-visual). Visual design
                tokens live in components/ once the Design System exists.
utils/          Small, pure helper functions with no side effects.
```

Folders that don't have real content yet keep a `.gitkeep` placeholder so
the structure exists in git ahead of the stage that fills them in — an
empty folder is not a claim that the feature works.

Import alias: `@/` maps to the repo root (e.g. `@/constants/app`), configured
in `tsconfig.json` and `metro.config.js`.

### App icons

No custom app icon / splash / favicon is configured yet — `app.json`
intentionally omits those fields and Expo falls back to its defaults.
Real branded assets are added when the app has an actual design, in the
Design System or Store Release Preparation stage.
