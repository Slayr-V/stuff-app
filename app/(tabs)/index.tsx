import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppText, Icon, Input, LoadingIndicator, Logo, PlaceholderTile, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useFinds } from '@/hooks/useFinds';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/database';

// The Finds tab, per the design, is a library of every product you've
// identified across all your Finds (not a feed of the imported posts
// themselves — that's app/finds/[id] for a specific post's full context).
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
      <ScreenContainer contentContainerStyle={styles.center} padded>
        <AppText variant="emptyTitle" style={styles.centerText}>
          Sign in to see your finds
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          Finds are private to your account.
        </AppText>
        <AppButton title="Go to Profile" onPress={() => router.push('/profile')} style={styles.actionButton} />
      </ScreenContainer>
    );
  }

  return <FindsHome />;
}

function FindsHome() {
  const { products, loading, error, refresh } = useProducts();
  const { finds, refresh: refreshFinds } = useFinds();
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshFinds();
    }, [refresh, refreshFinds]),
  );

  const findPlatformById = useMemo(() => new Map(finds.map((f) => [f.id, f.platform])), [finds]);
  const platforms = useMemo(() => Array.from(new Set(finds.map((f) => f.platform))), [finds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (platformFilter && findPlatformById.get(product.find_id) !== platformFilter) return false;
      if (!q) return true;
      return product.name.toLowerCase().includes(q) || (product.brand ?? '').toLowerCase().includes(q);
    });
  }, [products, query, platformFilter, findPlatformById]);

  return (
    <ScreenContainer contentContainerStyle={styles.screenPadding} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Logo height={22} />
        <View style={styles.headerIcons}>
          <View style={styles.headerIconButton}>
            <Icon name="search" size={16} color={theme.colors.ink} />
          </View>
          <View style={styles.headerIconButton}>
            <Icon name="notification" size={16} color={theme.colors.ink} />
          </View>
        </View>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.center}>
          <LoadingIndicator label="Loading your finds…" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText variant="emptyTitle" style={styles.centerText}>
            Couldn&apos;t load your finds
          </AppText>
          <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
            {error}
          </AppText>
          <AppButton title="Try again" variant="secondary" onPress={refresh} style={styles.actionButton} />
        </View>
      ) : products.length === 0 ? (
        <EmptyFinds />
      ) : (
        <View style={styles.listArea}>
          <View style={styles.searchWrap}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search your finds"
              style={styles.searchInput}
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['all', ...platforms]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const isAll = item === 'all';
              const selected = isAll ? platformFilter === null : platformFilter === item;
              return (
                <Pressable onPress={() => setPlatformFilter(isAll ? null : item)}>
                  <View style={[styles.chip, selected && styles.chipSelected]}>
                    <AppText variant="filterChip" style={selected ? styles.chipTextSelected : styles.chipText}>
                      {isAll ? `All ${products.length}` : item}
                    </AppText>
                  </View>
                </Pressable>
              );
            }}
          />
          <FlatList
            data={filtered}
            keyExtractor={(product) => product.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

function EmptyFinds() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.dashedGrid}>
        <View style={[styles.dashedSlot, styles.dashedSlotCenter]}>
          <Icon name="plus" size={20} color="#C4C4C4" strokeWidth={1.5} />
        </View>
        <View style={styles.dashedSlot} />
        <View style={styles.dashedSlot} />
        <View style={styles.dashedSlot} />
      </View>
      <View style={styles.emptyTextGroup}>
        <AppText variant="emptyTitle" style={styles.centerText}>
          Nothing found yet
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody, styles.emptySubtitle]}>
          Share a post, scan something, or paste a link — stuff works out what&apos;s in it.
        </AppText>
      </View>
      <AppButton title="Add your first find" onPress={() => router.push('/import')} style={styles.emptyButton} />
      <AppText variant="metadata" style={styles.emptyCaption}>
        or use the share sheet from any app
      </AppText>
    </View>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <Animated.View style={styles.cardWrapper} entering={FadeInDown.duration(350).delay(Math.min(index, 8) * 40)}>
      <Pressable onPress={() => router.push(`/products/${product.id}`)}>
        <View>
          <PlaceholderTile caption="product shot" style={styles.cardImage} />
          <View style={styles.saveFlag}>
            <Icon name="bookmark" size={14} color={theme.colors.ink} strokeWidth={1.4} />
          </View>
        </View>
        <View style={styles.cardText}>
          {product.brand ? <AppText variant="brandLabel">{product.brand}</AppText> : null}
          <AppText variant="cardName" numberOfLines={2}>
            {product.name}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
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
    paddingBottom: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listArea: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: 14,
  },
  searchInput: {
    height: 44,
    borderRadius: theme.radii.full,
  },
  chipRow: {
    gap: 8,
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: 18,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
  },
  chipSelected: {
    backgroundColor: theme.colors.ink,
  },
  chipText: {
    color: '#5A5A5A',
  },
  chipTextSelected: {
    color: theme.colors.primaryText,
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
    gap: theme.spacing.cardGap,
  },
  cardImage: {
    aspectRatio: 1,
  },
  saveFlag: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.saveFlag,
  },
  cardText: {
    gap: 2,
    paddingHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: theme.spacing.gutter,
  },
  dashedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 300,
    gap: 14,
  },
  dashedSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: theme.radii.panel,
    borderWidth: 1.5,
    borderColor: theme.colors.dashed,
    borderStyle: 'dashed',
  },
  dashedSlotCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextGroup: {
    marginTop: 38,
    gap: 8,
    alignItems: 'center',
  },
  emptySubtitle: {
    maxWidth: 270,
  },
  emptyButton: {
    marginTop: 26,
    width: '100%',
    maxWidth: 300,
  },
  emptyCaption: {
    marginTop: 14,
    color: theme.colors.textQuaternary,
  },
});
