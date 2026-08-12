import { supabase } from './supabase';

// Thin wrappers around supabase-js auth calls. Screens should call these
// rather than reaching into `supabase.auth` directly, so there's one
// place to change if the auth backend or error handling ever changes.

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
