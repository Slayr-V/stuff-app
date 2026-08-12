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
- Supabase (Postgres, Auth, Storage, Edge Functions) — added in a later stage
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

## Project structure

```
app/            Expo Router routes (screens)
```

More structure (components, features, services, hooks, types, constants)
is introduced in the Folder & Code Architecture stage.

### App icons

No custom app icon / splash / favicon is configured yet — `app.json`
intentionally omits those fields and Expo falls back to its defaults.
Real branded assets are added when the app has an actual design, in the
Design System or Store Release Preparation stage.
