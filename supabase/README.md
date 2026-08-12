# Database migrations

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
