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
  // Populated by the onboarding quiz (app/onboarding/index.tsx) once a
  // real session exists to write to — null for anyone who signed in
  // without taking it (the welcome screen's "I already have an account"
  // shortcut) rather than defaulted to something fake.
  onboarding_answers: Record<string, string[]> | null;
  onboarding_completed_at: string | null;
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

// Shape supabase-js's createClient<Database>() expects, so
// `supabase.from('boards')` etc. are typed end to end (row shape,
// insertable columns, updatable columns) instead of `any`.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, 'id'> & Partial<Omit<Profile, 'id'>>;
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      finds: {
        Row: Find;
        Insert: Pick<Find, 'user_id' | 'platform'> & Partial<Omit<Find, 'user_id' | 'platform'>>;
        Update: Partial<Omit<Find, 'id' | 'user_id'>>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Pick<Product, 'find_id' | 'user_id' | 'name'> & Partial<Omit<Product, 'find_id' | 'user_id' | 'name'>>;
        Update: Partial<Omit<Product, 'id' | 'find_id' | 'user_id'>>;
        Relationships: [
          {
            foreignKeyName: 'products_find_id_fkey';
            columns: ['find_id'];
            isOneToOne: false;
            referencedRelation: 'finds';
            referencedColumns: ['id'];
          },
        ];
      };
      boards: {
        Row: Board;
        Insert: Pick<Board, 'user_id' | 'name'> & Partial<Omit<Board, 'user_id' | 'name'>>;
        Update: Partial<Omit<Board, 'id' | 'user_id'>>;
        Relationships: [];
      };
      board_products: {
        Row: BoardProduct;
        Insert: Pick<BoardProduct, 'board_id' | 'product_id'> & Partial<Omit<BoardProduct, 'board_id' | 'product_id'>>;
        Update: Partial<Omit<BoardProduct, 'board_id' | 'product_id'>>;
        Relationships: [
          {
            foreignKeyName: 'board_products_board_id_fkey';
            columns: ['board_id'];
            isOneToOne: false;
            referencedRelation: 'boards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'board_products_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    // No views or functions yet — both required by supabase-js's
    // GenericSchema constraint even when empty. Omitting them entirely
    // silently falls back to `any` internally, which is worse than this.
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
