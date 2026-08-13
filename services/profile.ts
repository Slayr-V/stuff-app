import { supabase } from './supabase';

// Persists the onboarding quiz's real answers (the user's own selections
// — categories, taste tiles, sources, budget) once a real session exists
// to attach them to. Called best-effort right after sign-up/sign-in
// succeeds; nothing in the app reads this yet (Discover personalization
// is a later feature), but the data itself is real, not fabricated, so
// there's no reason to wait to start capturing it.
export async function saveOnboardingAnswers(userId: string, answers: Record<string, string[]>) {
  const hasAnswers = Object.values(answers).some((list) => list.length > 0);
  if (!hasAnswers) return;

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_answers: answers, onboarding_completed_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}
