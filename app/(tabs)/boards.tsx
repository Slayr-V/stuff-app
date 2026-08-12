import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import type { Board } from '@/types/database';

export default function BoardsScreen() {
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
        <AppText variant="title">Sign in to see your Boards</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          Boards are private to your account.
        </AppText>
        <AppButton title="Go to Profile" onPress={() => router.push('/profile')} style={styles.signInButton} />
      </ScreenContainer>
    );
  }

  return <BoardsList />;
}

function BoardsList() {
  const { boards, loading, error, refresh } = useBoards();

  // Refetch every time this tab regains focus (e.g. coming back from
  // "New Board") rather than wiring up manual refresh signaling.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading && boards.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator label="Loading Boards…" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="title">Couldn&apos;t load Boards</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          {error}
        </AppText>
        <AppButton title="Try again" variant="secondary" onPress={refresh} style={styles.signInButton} />
      </ScreenContainer>
    );
  }

  if (boards.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="title">No Boards yet</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          Create a Board to organise your saved products.
        </AppText>
        <AppButton title="Create Board" onPress={() => router.push('/boards/new')} style={styles.signInButton} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.listContainer}>
      <View style={styles.header}>
        <AppText variant="heading">Boards</AppText>
        <AppButton title="New Board" variant="secondary" onPress={() => router.push('/boards/new')} />
      </View>
      <FlatList
        data={boards}
        keyExtractor={(board) => board.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <BoardCard board={item} />}
      />
    </ScreenContainer>
  );
}

function BoardCard({ board }: { board: Board }) {
  return (
    <Pressable style={styles.cardWrapper} onPress={() => router.push(`/boards/${board.id}`)}>
      <Card style={styles.card}>
        <View style={styles.cardCover} />
        <AppText variant="label" numberOfLines={1}>
          {board.name}
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
  signInButton: {
    marginTop: theme.spacing.sm,
  },
  listContainer: {
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    gap: theme.spacing.md,
  },
  row: {
    gap: theme.spacing.md,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    gap: theme.spacing.sm,
  },
  cardCover: {
    aspectRatio: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.border,
  },
});
