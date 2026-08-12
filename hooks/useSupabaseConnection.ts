import { useEffect, useState } from 'react';

import { isSupabaseConfigured } from '@/services/supabase';

export type SupabaseConnectionStatus = 'checking' | 'connected' | 'not-configured' | 'error';

export type SupabaseConnectionResult = {
  status: SupabaseConnectionStatus;
  errorMessage: string | null;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Genuinely pings the configured Supabase project's Auth health endpoint
// (no schema/auth session required, so this works ahead of the
// Authentication / Database Schema stages) to prove the client is talking
// to a real, reachable Supabase project — not just that env vars parse.
//
// The apikey header is required here: Supabase's gateway rejects every
// request to the project domain with 401 if it's missing, even for this
// health check — it's not optional the way "no auth needed" might imply.
export function useSupabaseConnection(): SupabaseConnectionResult {
  const [status, setStatus] = useState<SupabaseConnectionStatus>(isSupabaseConfigured ? 'checking' : 'not-configured');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Nothing to check — the initial state above already reflects this.
    if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
      return;
    }

    let cancelled = false;

    fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(`Supabase responded with HTTP ${response.status}`);
        }
        setStatus('connected');
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, errorMessage };
}
