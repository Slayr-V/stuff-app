import { supabase } from './supabase';
import type { FindPlatform } from '@/types/database';

// Mirrors the analyze-find Edge Function's output shape.
export type ExtractedProduct = {
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
};

type AnalyzeFindResponse = {
  products?: ExtractedProduct[];
  error?: string;
};

// Calls the server-side AI extraction (see
// supabase/functions/analyze-find). supabase-js automatically attaches
// the signed-in user's JWT — the function rejects anonymous callers.
export async function analyzeFind(input: { caption: string; sourceUrl?: string }): Promise<ExtractedProduct[]> {
  const { data, error } = await supabase.functions.invoke<AnalyzeFindResponse>('analyze-find', {
    body: { caption: input.caption, sourceUrl: input.sourceUrl ?? '' },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.products ?? [];
}

// Persists a reviewed/edited draft as a real Find + Products. Only called
// after the user has seen and confirmed the extracted products — never
// automatically after analyzeFind() returns.
export async function saveFindWithProducts(params: {
  userId: string;
  platform: FindPlatform;
  caption: string;
  sourceUrl?: string;
  products: ExtractedProduct[];
}) {
  const { userId, platform, caption, sourceUrl, products } = params;

  const { data: find, error: findError } = await supabase
    .from('finds')
    .insert({
      user_id: userId,
      platform,
      caption,
      source_url: sourceUrl || null,
    })
    .select()
    .single();
  if (findError) throw findError;

  if (products.length > 0) {
    // match_type 'mentioned', not 'exact_match'/'likely_match' — these
    // came from the creator's own caption text, not a confirmed retailer
    // match. Product Search (a later stage) is what can earn a stronger
    // classification.
    const { error: productsError } = await supabase.from('products').insert(
      products.map((product) => ({
        find_id: find.id,
        user_id: userId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        match_type: 'mentioned' as const,
      })),
    );
    if (productsError) throw productsError;
  }

  return find;
}
