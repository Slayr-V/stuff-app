import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { APP_NAME } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { useFinds } from '@/hooks/useFinds';
import type { Find } from '@/types/database';

export default function FindsScreen() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  if (!session) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="title">No Finds yet</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          Share a post from Instagram, TikTok, YouTube or the web to {APP_NAME}, or tap the + button below to import
          one manually.
        </AppText>
      </ScreenContainer>
    );
  }

  return <FindsList />;
}

function FindsList() {
  const { finds, loading, error, refresh } = useFinds();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading && finds.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator label="Loading Finds…" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="title">Couldn&apos;t load Finds</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          {error}
        </AppText>
        <AppButton title="Try again" variant="secondary" onPress={refresh} style={styles.actionButton} />
      </ScreenContainer>
    );
  }

  if (finds.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="title">No Finds yet</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          Tap the + button below to import your first one.
        </AppText>
        <AppButton title="Import" onPress={() => router.push('/import')} style={styles.actionButton} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.listContainer}>
      <FlatList
        data={finds}
        keyExtractor={(find) => find.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <FindCard find={item} />}
      />
    </ScreenContainer>
  );
}

function FindCard({ find }: { find: Find }) {
  return (
    <Pressable onPress={() => router.push(`/finds/${find.id}`)}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <AppText variant="caption" style={styles.platform}>
            {find.platform.toUpperCase()}
          </AppText>
        </View>
        <AppText variant="body" numberOfLines={2}>
          {find.caption || 'No caption'}
        </AppText>
      </Card>
    </Pressable>
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
  actionButton: {
    marginTop: theme.spacing.sm,
  },
  listContainer: {
    flexGrow: 1,
  },
  list: {
    gap: theme.spacing.sm,
  },
  card: {
    gap: theme.spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  platform: {
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
});
