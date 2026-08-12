# Aisle

Turn any social post into a shopping list.

Aisle is a mobile shopping utility: send a post from Instagram, TikTok,
YouTube, Pinterest, Facebook, or the web to Aisle, and it identifies the
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

This currently runs fine in Expo Go. Native functionality (e.g. the Share
Extension for receiving content from other apps) will require moving to an
Expo Development Build later in the roadmap — see `app.json` / the project
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
+ AsyncStorage for session persistence). If `EXPO_PUBLIC_SUPABASE_URL` /
`_ANON_KEY` aren't set, the client still initializes (against a placeholder
URL) rather than crashing the app — `isSupabaseConfigured` tells callers
whether it's actually usable.

`hooks/useSupabaseConnection.ts` pings the project's public Auth health
endpoint to confirm the app is actually reaching your Supabase project —
this works ahead of any schema or authenticated call existing. Its result
is surfaced on the **Profile** tab as a small dev-only status card
(connected / not configured / error), which goes away once Profile shows
a real signed-in account.

No schema, no auth flows, and no Row Level Security policies exist yet —
those are the Authentication and Initial Database Schema stages.

## Navigation

Primary structure is a tab navigator: **Finds | Boards | + | Search | Profile**.

- `app/(tabs)/` — the four real tabs (Finds, Boards, Search, Profile), each
  currently a placeholder empty-state screen.
- The **+** tab is an action, not a screen: it's intercepted in
  `app/(tabs)/_layout.tsx` and pushes `app/import.tsx`, presented as a
  modal over the tabs — that's where manual import will live.

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

Every screen (`app/(tabs)/*`, `app/import.tsx`) is built on these — there
are no raw `View`/`Text` screen roots or hardcoded colors left in `app/`.
`Card` and `LoadingIndicator` are now proven in the Profile tab's Supabase
status card. `Input` still has no real call site (no form exists yet); it
gets one in the Authentication stage.

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
                with the Core Aisle Library stage.
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
