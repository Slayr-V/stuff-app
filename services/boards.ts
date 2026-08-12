import { supabase } from './supabase';

// Real Supabase reads/writes against the boards table — RLS (see
// supabase/migrations) is what actually enforces that these only ever
// touch the calling user's own rows; these functions don't re-check that.

export async function listBoards() {
  const { data, error } = await supabase.from('boards').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBoard(id: string) {
  const { data, error } = await supabase.from('boards').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createBoard(userId: string, name: string) {
  const { data, error } = await supabase.from('boards').insert({ user_id: userId, name }).select().single();
  if (error) throw error;
  return data;
}

export async function renameBoard(id: string, name: string) {
  const { data, error } = await supabase.from('boards').update({ name }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBoard(id: string) {
  const { error } = await supabase.from('boards').delete().eq('id', id);
  if (error) throw error;
}

// Real per-board saved-product counts, grouped client-side rather than
// via a PostgREST embedded count (keeps the Relationships typing in
// types/database.ts one-directional and simple). RLS already scopes this
// to the caller's own board_products rows.
export async function listBoardProductCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('board_products').select('board_id');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.board_id] = (counts[row.board_id] ?? 0) + 1;
  }
  return counts;
}

export async function listProductsForBoard(boardId: string) {
  const { data, error } = await supabase
    .from('board_products')
    .select('product_id, products(*)')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((row) => row.products)
    .filter((product): product is NonNullable<typeof product> => product !== null);
}

export async function addProductToBoard(boardId: string, productId: string) {
  const { error } = await supabase.from('board_products').insert({ board_id: boardId, product_id: productId });
  if (error) throw error;
}

export async function removeProductFromBoard(boardId: string, productId: string) {
  const { error } = await supabase.from('board_products').delete().eq('board_id', boardId).eq('product_id', productId);
  if (error) throw error;
}
