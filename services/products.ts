import { supabase } from './supabase';

// The Finds tab, per the design, is really a library of identified
// products across all the user's Finds (not a feed of imported posts —
// that's what tapping into an individual Find's detail is for). Hence a
// dedicated products listing here rather than reusing services/finds.ts.

export async function listProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

// Product Detail's "Found via" row needs the parent Find's platform —
// embedded via the products -> finds relationship rather than a second
// round trip.
export async function getProductWithFind(id: string) {
  const { data, error } = await supabase.from('products').select('*, finds(platform, source_url)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

// Board names a product is currently saved to, for Product Detail's "In
// boards" row.
export async function listBoardsForProduct(productId: string) {
  const { data, error } = await supabase.from('board_products').select('boards(id, name)').eq('product_id', productId);
  if (error) throw error;
  return (data ?? []).map((row) => row.boards).filter((board): board is { id: string; name: string } => board !== null);
}
