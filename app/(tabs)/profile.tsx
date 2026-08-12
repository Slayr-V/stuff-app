import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Input, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { signInWithEmail, signOut, signUpWithEmail } from '@/services/auth';

// Real Supabase email/password authentication. Sign in with Apple/Google
// need a Development Build (native modules Expo Go can't run) — out of
// scope until that migration happens. Preferences (country, currency,
// etc.) are a later stage; this screen is just account state for now.
export default function ProfileScreen() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator label="Loading account…" />
      </ScreenContainer>
    );
  }

  return session ? <SignedInPanel email={session.user.email ?? 'Unknown email'} /> : <AuthForm />;
}

function SignedInPanel({ email }: { email: string }) {
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong signing out.');
      setSigningOut(false);
    }
  }

  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <AppText variant="title">Profile</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        {email}
      </AppText>
      <AppButton title="Sign out" variant="secondary" loading={signingOut} onPress={handleSignOut} style={styles.button} />
      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </ScreenContainer>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'sign-up') {
        const result = await signUpWithEmail(email, password);
        if (!result.session) {
          setInfo('Check your email to confirm your account, then sign in.');
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError(null);
    setInfo(null);
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.formContainer}>
      <View style={styles.header}>
        <AppText variant="title">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          {mode === 'sign-in'
            ? 'Sign in to save products and access your Boards.'
            : 'Create an account to start saving products.'}
        </AppText>
      </View>

      <View style={styles.fields}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === 'sign-up' ? 'password-new' : 'password'}
          textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
        />
      </View>

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
      {info ? <AppText variant="caption">{info}</AppText> : null}

      <AppButton
        title={mode === 'sign-in' ? 'Sign in' : 'Create account'}
        onPress={handleSubmit}
        loading={submitting}
        disabled={!email || !password}
      />
      <AppButton
        title={mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        variant="ghost"
        onPress={toggleMode}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.sm,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
  formContainer: {
    gap: theme.spacing.md,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  fields: {
    gap: theme.spacing.sm,
  },
});
