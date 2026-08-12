import { supabase } from './supabase';

// Real Supabase reads/writes against the boards table — RLS (see
// supabase/migrations) is what actually enforces that these only ever
// touch the calling user's own rows; these functions don't re-check that.

export async function listBoards() {
  const { data, error } = await supabase.from('boards').select('*').order('created_at', { ascending: false });
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
