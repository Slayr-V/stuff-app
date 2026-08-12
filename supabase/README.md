# Supabase (database + Edge Functions)

## Database migrations

SQL migrations live in `migrations/`, one file per change, named
`<timestamp>_<description>.sql`. Never modify a production database
structure by hand outside of a migration file.

## Applying a migration (current workflow)

No Supabase CLI project link is set up yet, so for now: open your
**development** Supabase project → **SQL Editor** → paste the contents of
the migration file → **Run**. Migrations here are written to be safely
re-run (`IF NOT EXISTS`, `CREATE OR REPLACE`, guarded enum creation), so
re-pasting one by accident won't break anything.

## Future: Supabase CLI

Once schema changes get frequent enough to be worth it, switch to:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

This tracks which migrations have run in the database itself, rather than
relying on "did I already paste this one." Not set up yet — introduce it
when the manual workflow actually becomes the bottleneck, not before.

## Current schema (`20260812120000_initial_schema.sql`)

| Table | Purpose |
|---|---|
| `profiles` | One row per user, kept in sync with `auth.users` by a trigger on signup |
| `finds` | An imported piece of source content |
| `products` | A product identified within a Find (0..N per Find) |
| `boards` | A user's saved-product collection |
| `board_products` | Join table: a product saved to a board (many-to-many) |

All five tables have Row Level Security enabled — a user can only ever
read or write their own rows. `board_products` has no `user_id` column of
its own; ownership is proven via the parent board (and, on insert, the
product too).

**"All Saved"** (the system collection mentioned in the project spec) is
intentionally not a real row in `boards` — it's the union of a user's
products across all their boards, computed at query time once the Boards
UI exists. A real row would need special-cased rename/delete protection
for no real benefit.

Deliberately not in this migration yet: `import_jobs`, `source_assets`,
`product_evidence`, `retail_offers`, `product_feedback`,
`outbound_clicks`, `usage_events`, `subscriptions` — those belong to
later stages (Import System, Product Search, RevenueCat, Analytics).

## Edge Functions

`functions/analyze-find/` — takes a pasted caption (+ optional source
URL) and returns candidate products via OpenAI structured output. Does
**not** write to the database and does **not** fetch/scrape the source
URL server-side (Instagram/TikTok etc. block naive scraping — the
caption is supplied directly by the user instead, which actually works).
The client shows an editable draft review screen before saving anything
for real.

### Required secrets

| Secret | Required | Notes |
|---|---|---|
| `OPENAI_API_KEY` | Yes | From platform.openai.com. Never commit this — set it as a secret, not an env var in code. |
| `OPENAI_MODEL` | No | Defaults to a low-cost model in code. Override to change models without redeploying. |

`SUPABASE_URL` / `SUPABASE_ANON_KEY` are auto-injected by the platform —
don't set those yourself.

### Deploying (not done yet — do this manually)

Requires the Supabase CLI, authenticated and linked to your project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase functions deploy analyze-find
```

The function requires a real signed-in user's JWT (checked inside the
function, not just "a valid API key") — it costs money per call, so it
must never be reachable anonymously.

### Local development / verifying changes

Checked with `deno check` / `deno lint` (not this project's `tsc`/eslint
— Deno has different globals and module resolution, see
`eslint.config.js`'s ignore list). To actually run it locally:

```bash
npx supabase functions serve analyze-find --env-file .env.local
```

(`.env.local` would hold `OPENAI_API_KEY` for local testing — gitignored,
same as the app's `.env`.)
