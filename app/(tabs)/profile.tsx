import { StyleSheet, View } from 'react-native';

import { AppText, Card, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';

const STATUS_COPY: Record<string, string> = {
  checking: 'Checking…',
  connected: 'Connected',
  'not-configured': 'Not configured',
  error: 'Connection error',
};

const STATUS_COLOR: Record<string, string> = {
  checking: theme.colors.textMuted,
  connected: '#16A34A',
  'not-configured': theme.colors.textMuted,
  error: theme.colors.danger,
};

// Placeholder Profile screen. Real authentication, account state and
// preferences (country, currency, preferred retailers) are built in the
// Authentication and User Preferences stages. The Supabase status card
// below is a temporary developer diagnostic for the Supabase Integration
// stage — it goes away once this screen shows a real signed-in account.
export default function ProfileScreen() {
  const { status, errorMessage } = useSupabaseConnection();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Profile</AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Account and preferences will appear here once you&apos;re signed in.
        </AppText>
      </View>

      <Card style={styles.card}>
        <AppText variant="label">Supabase (development)</AppText>
        {status === 'checking' ? (
          <LoadingIndicator />
        ) : (
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
            <AppText variant="body" style={{ color: STATUS_COLOR[status] }}>
              {STATUS_COPY[status]}
            </AppText>
          </View>
        )}
        {status === 'not-configured' ? (
          <AppText variant="caption">Set EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY in .env — see .env.example.</AppText>
        ) : null}
        {status === 'error' && errorMessage ? (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xl,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    gap: theme.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  errorText: {
    color: theme.colors.danger,
  },
});
