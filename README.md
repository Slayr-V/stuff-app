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

Primary structure is a tab navigator: **Finds | Boards | Search | Profile**,
plus a floating **+** action for Import.

- `app/(tabs)/` — Finds, Boards and Profile are real; Search is still a
  placeholder empty state.
- Finds tab lists real `finds` (`app/finds/[id]/index.tsx` for detail +
  products) — see Import & AI product extraction above for how they get
  there.
- **Import is a floating action button, not a tab item.** It used to be a
  5th tab whose press was intercepted (`listeners.tabPress` +
  `preventDefault()`) to open `app/import.tsx` as a modal instead of
  actually navigating there. That pattern turned out to be exactly the
  kind of thing worth not doing: it was both a mismatch with the
  reference UI (a real FAB) and a reliability problem — event
  interception depending on `preventDefault()` actually working is a
  weaker foundation than a button whose `onPress` just directly calls
  `router.push('/import')`. Replaced with `components/Fab.tsx`,
  overlaid on `app/(tabs)/_layout.tsx`.

## Design system

`components/` holds the UI foundations every screen is built on. Visual
direction follows a design handoff package (high-fidelity mockups + a
written spec covering every screen, flow, and token) delivered after the
earlier ReciMe-inspired pass: strictly monochrome (near-black ink on
white, a handful of light greys for surfaces/tiles/hairlines), the system
font throughout (no custom typeface), and emphasis driven entirely by
weight/size/spacing rather than color or a display face.

| Component         | Purpose                                              |
| ------------------ | ----------------------------------------------------- |
| `theme`             | Design tokens: `colors`, `spacing`, `radii`, `typography`, `shadows` |
| `AppText`           | Typography — `variant` selects one of ~20 named roles from the handoff's type scale (screenTitle, sheetTitle, bottomSheetTitle, body, metadata, eyebrow, matchBadge, ...) |
| `AppButton`         | Buttons — `variant`: primary/secondary/ghost, `size`: large (52px pill) / small (36px compact pill), animated press (Reanimated spring) |
| `Fab`               | 56×56 black circular floating action button — animated press, positioned by the caller |
| `Input`             | Labeled text input with an `error` state, filled (no border) style |
| `Card`              | Flat surface container, no border/shadow by default — separation comes from grey fill against white |
| `Icon`              | Custom `react-native-svg` icon set (tab icons, chevron, search, share, bookmark, scan, link, describe, ...) transcribed from the handoff — no icon-font dependency |
| `PlaceholderTile`   | Diagonal-stripe SVG placeholder + monospace caption, used everywhere real imagery (product shots, board covers) doesn't exist yet |
| `BoardCollage`      | 3-panel image collage (1 large + 2 stacked) used at three sizes across Boards/Board Detail |
| `BottomSheet`       | Reusable scrim + rounded-top sheet chrome for `transparentModal` routes (New Board, Save to board, Add to stuff) |
| `Spinner`           | Real rotating ring spinner (Reanimated `withRepeat`), not a static image |
| `LoadingIndicator`  | `ActivityIndicator` with an optional label, for plain loading states |
| `Logo`              | The real Stuff wordmark (`assets/brand/stuff-logo.jpg`), cropped via the handoff's exact offset/scale math |
| `ScreenContainer`   | Safe-area-aware screen root with configurable edges/background/padding |

Import from the barrel: `import { AppText, ScreenContainer } from '@/components'`.

Every screen is built on these — there are no raw `View`/`Text` screen
roots or hardcoded colors left in `app/`.

**Fonts**: system font only (no bundled typeface) — the earlier Playfair
Display serif pass was removed along with `expo-font` /
`@expo-google-fonts/playfair-display` when this monochrome direction
superseded it.

**Animation**: list items fade/slide in on mount (Reanimated
`FadeInDown`, staggered by index); buttons, the FAB, and list rows scale
down on press (`withSpring`); the analysing checklist and any loading
state use a real rotating `Spinner`, not a static graphic. All real
Reanimated usage, not the `Animated` API from core React Native.

**Placeholders, not fake data**: every product shot, board cover, and
avatar in the design is an image slot this app has no real picture for
yet (`products.image_url` / `finds.thumbnail_url` aren't populated by any
current pipeline). Rather than embed stock/generated imagery to match the
mockup visually, every one of those slots renders `PlaceholderTile` — a
genuine, honest "there's no image here yet" state with a caption naming
what belongs there. The same principle drove several screens to diverge
from the handoff's example content: no fabricated price, retailer link,
confidence percentage (hidden when `null` rather than shown as 0%), or
curated/trending Discover content — see "Import flow" and the tab
sections below for the specific calls made per screen.

**Logo**: `assets/brand/stuff-logo.jpg` is the real wordmark, wired as
the app icon, splash screen, and web favicon in `app.json`, and shown in
the Finds tab header via the `Logo` component. It's 736×736 — below
Apple's 1024×1024 recommendation for the App Store icon specifically;
fine for development, worth a higher-res export before Store Release
Preparation.

No dark mode yet — not asked for — but because screens read colors from
`theme` rather than hardcoding hex values, adding it later is a token
change, not a rewrite.

### Import flow

Entered from the FAB (every tab) or the Finds empty state, all screens
under `app/import/`, state shared via `hooks/useImportDraft.tsx`:

1. **Add to stuff** (`app/import/index.tsx`) — bottom sheet with 4 rows.
   Only 2 are wired to something real: this app has no share-sheet
   extension and no camera/object-recognition pipeline, so "Share from an
   app" and "Scan something" say so honestly instead of silently doing
   nothing. "Paste a link or screenshot" and "Describe it" both open
   Describe — the actual capability behind either is identical (caption
   text + an optional link), so they share one screen with copy framed
   to match whichever was tapped.
2. **Describe** (`app/import/describe.tsx`) — caption + optional source
   link, saved into the shared draft.
3. **Analysing** (`app/import/analyzing.tsx`) — a real `analyzeFind()`
   call in flight, not a fixed timer. The 3-step checklist reflects real
   request state (instant/spinner/done), matching the handoff's own
   instruction to drive this from the edge function's status in
   production.
4. **Results** (`app/import/results.tsx`) — the real extracted products,
   each tagged `match_type: 'mentioned'` (they came from caption text,
   not a confirmed retailer match) with a lightweight include/exclude
   toggle rather than the handoff's per-item board-picker — assigning a
   board only makes sense once the product row exists to attach to,
   which happens after Save.
5. **Save to board** (`app/board-picker.tsx`) — from Product Detail,
   lists real boards with real item counts.
6. **Toast** (`hooks/useToast.tsx`) — real black toast with Undo, shown
   after saving to a board.

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
empty folder is not a claim that the feature works. `utils/` lost its
placeholder once `formatRelativeTime.ts` gave it real content;
`features/` still carries theirs (`constants/` already had real content
from an earlier stage).

Import alias: `@/` maps to the repo root (e.g. `@/constants/app`), configured
in `tsconfig.json` and `metro.config.js`.

### App icons

Real now — see "Logo" under Design system above.
