import { supabase } from './supabase';

export async function listFinds() {
  const { data, error } = await supabase.from('finds').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getFind(id: string) {
  const { data, error } = await supabase.from('finds').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listProductsForFind(findId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('find_id', findId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
