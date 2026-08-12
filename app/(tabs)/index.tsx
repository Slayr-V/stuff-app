import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppText, Card, LoadingIndicator, ScreenContainer, theme } from '@/components';
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
          Sign in to start saving products from the posts you find.
        </AppText>
        <AppButton title="Go to Profile" onPress={() => router.push('/profile')} style={styles.actionButton} />
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
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card variant="feature" style={styles.featureCard}>
            <AppText variant="heading" style={styles.centerText}>
              Let&apos;s find{'\n'}something good
            </AppText>
            <AppText variant="subtitle" style={styles.centerText}>
              Tap the + button below to import your first Find.
            </AppText>
          </Card>
        </Animated.View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.listContainer}>
      <FlatList
        data={finds}
        keyExtractor={(find) => find.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <FindCard find={item} index={index} />}
      />
    </ScreenContainer>
  );
}

function FindCard({ find, index }: { find: Find; index: number }) {
  return (
    <Animated.View entering={FadeInDown.duration(350).delay(Math.min(index, 8) * 40)}>
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
    </Animated.View>
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
  featureCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
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
