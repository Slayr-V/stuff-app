import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Icon, LoadingIndicator, theme } from '@/components';
import { useBoards } from '@/hooks/useBoards';
import { useToast } from '@/hooks/useToast';
import { addProductToBoard, removeProductFromBoard } from '@/services/boards';

export default function BoardPickerScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { boards, loading } = useBoards();
  const { show } = useToast();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleSave(boardId: string, boardName: string) {
    setSavingId(boardId);
    try {
      await addProductToBoard(boardId, productId);
      router.back();
      show(`Saved to ${boardName}`, () => {
        removeProductFromBoard(boardId, productId).catch(() => {
          // Best-effort undo — if it fails the product just stays saved,
          // which is the safer failure direction.
        });
      });
    } catch (err) {
      setSavingId(null);
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Try again.');
    }
  }

  return (
    <BottomSheet title="Save to board">
      {loading ? (
        <LoadingIndicator />
      ) : boards.length === 0 ? (
        <AppText variant="body" style={styles.empty}>
          You don&apos;t have any Boards yet.
        </AppText>
      ) : (
        boards.map((board) => (
          <Pressable key={board.id} style={styles.row} onPress={() => handleSave(board.id, board.name)} disabled={!!savingId}>
            <View style={styles.thumb} />
            <View style={styles.rowText}>
              <AppText variant="label">{board.name}</AppText>
              <AppText variant="metadata">
                {board.itemCount} item{board.itemCount === 1 ? '' : 's'}
              </AppText>
            </View>
            {savingId === board.id ? (
              <LoadingIndicator />
            ) : (
              <View style={styles.selectionRing} />
            )}
          </Pressable>
        ))
      )}
      <Pressable
        style={styles.row}
        onPress={() => {
          router.back();
          router.push('/boards/new');
        }}
      >
        <View style={styles.newThumb}>
          <Icon name="plus" size={16} color="#C4C4C4" strokeWidth={1.6} />
        </View>
        <AppText variant="body" style={styles.newBoardLabel}>
          New board
        </AppText>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: theme.colors.textSecondary,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 10,
    borderRadius: theme.radii.panel,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.small,
    backgroundColor: theme.colors.tile,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  selectionRing: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.full,
    borderWidth: 1.6,
    borderColor: theme.colors.dashed,
  },
  newThumb: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.small,
    borderWidth: 1.5,
    borderColor: theme.colors.dashed,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBoardLabel: {
    color: theme.colors.textTertiary,
  },
});
