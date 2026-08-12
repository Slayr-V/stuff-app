// Hand-written types mirroring supabase/migrations/20260812120000_initial_schema.sql.
// Keep these in sync with that file. Once the Supabase CLI is linked to
// the project (see supabase/README.md), prefer replacing this with
// generated types (`supabase gen types typescript`) so they can't drift
// from the real schema.

export type FindPlatform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'facebook'
  | 'website'
  | 'screenshot'
  | 'video'
  | 'text';

export type MatchType = 'exact_match' | 'likely_match' | 'mentioned' | 'similar';

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
};

export type Find = {
  id: string;
  user_id: string;
  platform: FindPlatform;
  source_url: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  find_id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  variant: string | null;
  colour: string | null;
  size: string | null;
  description: string | null;
  image_url: string | null;
  match_type: MatchType | null;
  confidence: number | null;
  created_at: string;
};

export type Board = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type BoardProduct = {
  board_id: string;
  product_id: string;
  created_at: string;
};
