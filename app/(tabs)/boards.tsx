import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppText, BoardCollage, Icon, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useBoards, type BoardWithCount } from '@/hooks/useBoards';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

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
        <AppText variant="emptyTitle" style={styles.centerText}>
          Sign in to see your Boards
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          Boards are private to your account.
        </AppText>
        <AppButton title="Go to Profile" onPress={() => router.push('/profile')} style={styles.actionButton} />
      </ScreenContainer>
    );
  }

  return <BoardsHome />;
}

function BoardsHome() {
  const { boards, loading, error, refresh } = useBoards();

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
        <AppText variant="emptyTitle" style={styles.centerText}>
          Couldn&apos;t load Boards
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          {error}
        </AppText>
        <AppButton title="Try again" variant="secondary" onPress={refresh} style={styles.actionButton} />
      </ScreenContainer>
    );
  }

  const [pinned, ...rest] = boards;
  const gridItems: GridItem[] = [...rest.map((board): GridItem => ({ type: 'board', board })), { type: 'new' }];

  return (
    <ScreenContainer contentContainerStyle={styles.screenPadding} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <AppText variant="screenTitle">Boards</AppText>
        <AppButton title="New" size="small" onPress={() => router.push('/boards/new')} />
      </View>

      {boards.length === 0 ? (
        <View style={styles.center}>
          <AppText variant="emptyTitle" style={styles.centerText}>
            No Boards yet
          </AppText>
          <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
            Create a Board to organise your saved products.
          </AppText>
          <AppButton title="Create Board" onPress={() => router.push('/boards/new')} style={styles.actionButton} />
        </View>
      ) : (
        <FlatList
          data={gridItems}
          keyExtractor={(item) => (item.type === 'board' ? item.board.id : 'new-board-tile')}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.duration(400)}>
              <Pressable onPress={() => router.push(`/boards/${pinned.id}`)} style={styles.pinnedWrapper}>
                <BoardCollage height={216} radius={22} />
                <View style={styles.pinnedFooter}>
                  <View style={styles.pinnedTextGroup}>
                    <AppText variant="featureTitle">{pinned.name}</AppText>
                    <AppText variant="metadata">
                      {pinned.itemCount} item{pinned.itemCount === 1 ? '' : 's'} · updated {formatRelativeTime(pinned.updated_at)}
                    </AppText>
                  </View>
                  <AppText variant="eyebrow" style={styles.pinnedLabel}>
                    Most recent
                  </AppText>
                </View>
              </Pressable>
            </Animated.View>
          }
          renderItem={({ item, index }) =>
            item.type === 'board' ? <BoardGridCard board={item.board} index={index} /> : <NewBoardTile />
          }
        />
      )}
    </ScreenContainer>
  );
}

type GridItem = { type: 'board'; board: BoardWithCount } | { type: 'new' };

function BoardGridCard({ board, index }: { board: BoardWithCount; index: number }) {
  return (
    <Animated.View style={styles.cardWrapper} entering={FadeInDown.duration(350).delay(Math.min(index, 8) * 40)}>
      <Pressable onPress={() => router.push(`/boards/${board.id}`)}>
        <BoardCollage height={128} />
        <View style={styles.cardText}>
          <AppText variant="boardCardTitle" numberOfLines={1}>
            {board.name}
          </AppText>
          <AppText variant="metadata">
            {board.itemCount} item{board.itemCount === 1 ? '' : 's'}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function NewBoardTile() {
  return (
    <Pressable style={styles.cardWrapper} onPress={() => router.push('/boards/new')}>
      <View style={styles.newBoardTile}>
        <Icon name="plus" size={20} color="#C4C4C4" strokeWidth={1.5} />
      </View>
      <AppText variant="body" style={styles.newBoardLabel}>
        New board
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
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
  actionButton: {
    marginTop: theme.spacing.sm,
  },
  screenPadding: {
    flex: 1,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: 8,
    paddingBottom: 18,
  },
  pinnedWrapper: {
    marginHorizontal: theme.spacing.gutter,
    marginBottom: 24,
  },
  pinnedFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  pinnedTextGroup: {
    gap: 3,
  },
  pinnedLabel: {
    color: theme.colors.textSecondary,
  },
  grid: {
    paddingHorizontal: theme.spacing.gutter,
    rowGap: theme.spacing.gridGutterV,
  },
  gridRow: {
    gap: theme.spacing.gridGutterH,
  },
  cardWrapper: {
    flex: 1,
    gap: 10,
  },
  cardText: {
    gap: 2,
    paddingHorizontal: 2,
    paddingTop: 10,
  },
  newBoardTile: {
    height: 128,
    borderRadius: theme.radii.thumb,
    borderWidth: 1.5,
    borderColor: theme.colors.dashed,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBoardLabel: {
    color: theme.colors.textTertiary,
    paddingHorizontal: 2,
  },
});
