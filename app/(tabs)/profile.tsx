import Constants from 'expo-constants';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, Icon, Input, LoadingIndicator, PlaceholderTile, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useFinds } from '@/hooks/useFinds';
import { signInWithEmail, signOut, signUpWithEmail } from '@/services/auth';

// Real Supabase email/password authentication. Sign in with Apple/Google
// need a Development Build (native modules Expo Go can't run) — out of
// scope until that migration happens.
//
// No "stuff premium" card here — there's no RevenueCat integration yet
// (that's its own later stage), and showing one with a fake "renews 12
// Sep" date would be exactly the kind of false-completion claim the
// project rules forbid. ACCOUNT/SUPPORT rows below are genuinely inert
// (no settings/help screens exist yet) — matches the design handoff's
// own prototype, which doesn't wire them to anything either.
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

const ACCOUNT_ROWS = ['Profile details', 'Notifications', 'Preferences', 'Connected apps'];
const SUPPORT_ROWS = ['Help', 'Privacy', 'Terms'];

function SignedInPanel({ email }: { email: string }) {
  const { boards } = useBoards();
  const { finds } = useFinds();
  const [signingOut, setSigningOut] = useState(false);

  const findsThisMonth = finds.filter((find) => {
    const created = new Date(find.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  function handleSignOut() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (err) {
            setSigningOut(false);
            Alert.alert('Could not log out', err instanceof Error ? err.message : 'Try again.');
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.profileContainer} edges={['top', 'left', 'right']}>
      <View style={styles.avatarRow}>
        <PlaceholderTile radius={theme.radii.full} style={styles.avatar} />
        <View style={styles.avatarText}>
          <AppText variant="sheetTitle">{email.split('@')[0]}</AppText>
          <AppText variant="metadata">{email}</AppText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard} radius={theme.radii.tile}>
          <AppText variant="heading" style={styles.statNumber}>
            {findsThisMonth}
          </AppText>
          <AppText variant="metadata">Finds this month</AppText>
        </Card>
        <Card style={styles.statCard} radius={theme.radii.tile}>
          <AppText variant="heading" style={styles.statNumber}>
            {boards.length}
          </AppText>
          <AppText variant="metadata">Boards</AppText>
        </Card>
      </View>

      <AppText variant="eyebrow" style={styles.sectionLabel}>
        Account
      </AppText>
      <Card style={styles.groupedList} radius={theme.radii.panel}>
        {ACCOUNT_ROWS.map((label, i) => (
          <View key={label} style={[styles.row, i > 0 && styles.rowHairline]}>
            <AppText variant="listRow">{label}</AppText>
            <Icon name="chevronRight" size={12} color={theme.colors.chevron} />
          </View>
        ))}
      </Card>

      <AppText variant="eyebrow" style={styles.sectionLabel}>
        Support
      </AppText>
      <Card style={styles.groupedList} radius={theme.radii.panel}>
        {SUPPORT_ROWS.map((label, i) => (
          <View key={label} style={[styles.row, i > 0 && styles.rowHairline]}>
            <AppText variant="listRow">{label}</AppText>
            <Icon name="chevronRight" size={12} color={theme.colors.chevron} />
          </View>
        ))}
      </Card>

      <Card style={styles.logoutRow} radius={theme.radii.panel}>
        <AppText variant="listRow" style={styles.logoutText} onPress={signingOut ? undefined : handleSignOut}>
          {signingOut ? 'Logging out…' : 'Log out'}
        </AppText>
      </Card>

      <AppText variant="buildString" style={styles.buildString}>
        stuff {Constants.expoConfig?.version ?? '1.0.0'}
      </AppText>
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
        <AppText variant="bottomSheetTitle">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
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
  centerText: {
    textAlign: 'center',
  },
  mutedBody: {
    color: theme.colors.textSecondary,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
  formContainer: {
    gap: theme.spacing.md,
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: theme.spacing.gutter,
  },
  header: {
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  fields: {
    gap: theme.spacing.sm,
  },
  profileContainer: {
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: 8,
    paddingBottom: 40,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 24,
  },
  avatar: {
    width: 62,
    height: 62,
  },
  avatarText: {
    gap: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 26,
  },
  statCard: {
    flex: 1,
  },
  statNumber: {
    fontSize: 26,
    letterSpacing: -0.8,
  },
  sectionLabel: {
    paddingBottom: 10,
  },
  groupedList: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 17,
  },
  rowHairline: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  logoutRow: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logoutText: {
    color: theme.colors.textSecondary,
  },
  buildString: {
    textAlign: 'center',
    paddingTop: 20,
  },
});
