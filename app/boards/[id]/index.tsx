import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton, AppText, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { deleteBoard, getBoard } from '@/services/boards';
import type { Board } from '@/types/database';

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBoard(id)
      .then((result) => {
        if (!cancelled) setBoard(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this Board.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: board?.name ?? 'Board' });
  }, [navigation, board]);

  function handleDelete() {
    Alert.alert('Delete Board', `Delete "${board?.name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteBoard(id);
            router.back();
          } catch (err) {
            setDeleting(false);
            Alert.alert('Could not delete Board', err instanceof Error ? err.message : 'Try again.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  if (error || !board) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="title">Couldn&apos;t load this Board</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          {error ?? 'It may have been deleted.'}
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.empty}>
        <AppText variant="title">No products in this Board yet</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          Saved products will show up here.
        </AppText>
      </View>
      <View style={styles.actions}>
        <AppButton
          title="Rename"
          variant="secondary"
          onPress={() => router.push(`/boards/${board.id}/rename`)}
          style={styles.actionButton}
        />
        <AppButton title="Delete" variant="secondary" loading={deleting} onPress={handleDelete} style={styles.actionButton} />
      </View>
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
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
