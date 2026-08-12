import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Development Supabase project only — see .env.example. Production
// configuration is a separate project, wired up in the Production
// Preparation stage, never hardcoded here.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env and fill in your development Supabase project.',
  );
}

// The anon key is safe to ship in the client by design — it identifies
// the project, not a privileged caller, and every table it can touch must
// be protected by Row Level Security. The service-role key must never
// appear here or anywhere in this app; it stays server-side only.
//
// A syntactically-valid placeholder URL/key is used when unconfigured so
// createClient doesn't throw at import time and the app can still boot —
// every real request will simply fail until real credentials are set.
// Callers that care whether Supabase is actually usable should check
// `isSupabaseConfigured` (or use `useSupabaseConnection`) rather than
// assume this client is live.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// supabase-js's token auto-refresh runs on a timer that doesn't know the
// app is backgrounded — this pauses it while backgrounded and resumes (and
// immediately re-checks the token) on foreground, per Supabase's own
// guidance for React Native.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
