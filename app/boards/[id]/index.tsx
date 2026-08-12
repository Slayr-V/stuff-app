import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, BoardCollage, Icon, LoadingIndicator, PlaceholderTile, ScreenContainer, theme } from '@/components';
import { deleteBoard, getBoard, listProductsForBoard } from '@/services/boards';
import type { Board, Product } from '@/types/database';

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState<Board | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getBoard(id), listProductsForBoard(id)])
      .then(([boardResult, productsResult]) => {
        if (cancelled) return;
        setBoard(boardResult);
        setProducts(productsResult);
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

  function handleAdd() {
    Alert.alert('Add to this Board', 'Open a product from Finds or Discover and tap "Save to board" to add it here.');
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
        <AppText variant="emptyTitle" style={styles.centerText}>
          Couldn&apos;t load this Board
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          {error ?? 'It may have been deleted.'}
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={[]} contentContainerStyle={styles.flex} scroll>
      <View>
        <BoardCollage height={264} radius={0} />
        <Pressable onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 16 }]}>
          <BlurView intensity={30} tint="light" style={styles.roundButtonBlur} />
          <Icon name="back" size={15} color={theme.colors.ink} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <AppText variant="sheetTitle">{board.name}</AppText>
            <AppText variant="metadata">
              {products.length} item{products.length === 1 ? '' : 's'}
            </AppText>
          </View>
          <View style={styles.titleActions}>
            <AppButton title="Edit" size="small" variant="secondary" onPress={() => router.push(`/boards/${board.id}/rename`)} />
            <AppButton title="Add" size="small" onPress={handleAdd} />
          </View>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <AppText variant="body" style={styles.mutedBody}>
              No products in this Board yet.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(product) => product.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable style={styles.cardWrapper} onPress={() => router.push(`/products/${item.id}`)}>
                <PlaceholderTile caption="product shot" style={styles.cardImage} />
                <View style={styles.cardText}>
                  {item.brand ? <AppText variant="brandLabel">{item.brand}</AppText> : null}
                  <AppText variant="cardName" numberOfLines={2}>
                    {item.name}
                  </AppText>
                </View>
              </Pressable>
            )}
          />
        )}

        <AppButton title="Delete Board" variant="ghost" loading={deleting} onPress={handleDelete} style={styles.deleteButton} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flexGrow: 1,
  },
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
  backButton: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadows.floatingButton,
  },
  roundButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  content: {
    padding: theme.spacing.gutter,
    gap: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleGroup: {
    gap: 4,
  },
  titleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyProducts: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  grid: {
    rowGap: theme.spacing.gridGutterV,
  },
  gridRow: {
    gap: theme.spacing.gridGutterH,
  },
  cardWrapper: {
    flex: 1,
    gap: theme.spacing.cardGap,
  },
  cardImage: {
    aspectRatio: 1,
  },
  cardText: {
    gap: 2,
    paddingHorizontal: 2,
  },
  deleteButton: {
    marginTop: 8,
  },
});
