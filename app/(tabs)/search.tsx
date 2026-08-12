import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, Input, LoadingIndicator, PlaceholderTile, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/database';

// Real search over your own product library. The design's editorial
// sections (hero collection, "Curated for you", "Brands people save",
// "Trending finds") need real curated/cross-user content this app
// doesn't have yet — no admin content pipeline, no cross-user trending
// signal. Building those with fabricated data would be exactly the kind
// of premature discovery feed the project rules warn against, so this
// screen is real-search-only for now; see the README for the full
// reasoning and what a real version of those sections would need.
export default function DiscoverScreen() {
  const { session } = useAuth();
  const { products, loading } = useProducts();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c))),
    [products],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !categoryFilter) return [];
    return products.filter((product) => {
      if (categoryFilter && product.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        (product.brand ?? '').toLowerCase().includes(q) ||
        (product.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [products, query, categoryFilter]);

  const isSearching = query.trim().length > 0 || categoryFilter !== null;

  return (
    <ScreenContainer contentContainerStyle={styles.screenPadding} edges={['top', 'left', 'right']}>
      <AppText variant="screenTitle" style={styles.title}>
        Discover
      </AppText>
      <View style={styles.searchWrap}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="What are you looking for?"
          style={styles.searchInput}
        />
      </View>

      {categories.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const selected = categoryFilter === item;
            return (
              <Pressable onPress={() => setCategoryFilter(selected ? null : item)}>
                <View style={[styles.chip, selected && styles.chipSelected]}>
                  <AppText variant="filterChip" style={selected ? styles.chipTextSelected : undefined}>
                    {item}
                  </AppText>
                </View>
              </Pressable>
            );
          }}
        />
      ) : null}

      {!session ? (
        <View style={styles.center}>
          <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
            Sign in to search your saved products.
          </AppText>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <LoadingIndicator />
        </View>
      ) : isSearching ? (
        results.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
              No matches in your finds yet.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(product) => product.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => <ResultCard product={item} index={index} />}
          />
        )
      ) : (
        <View style={styles.comingSoon}>
          <AppText variant="sectionHeading">Curated collections</AppText>
          <AppText variant="body" style={styles.mutedBody}>
            Editorial picks, trending finds and brand directories need real curated content this app doesn&apos;t
            have yet. Search your own saved products above in the meantime.
          </AppText>
        </View>
      )}
    </ScreenContainer>
  );
}

function ResultCard({ product, index }: { product: Product; index: number }) {
  return (
    <Animated.View style={styles.cardWrapper} entering={FadeInDown.duration(350).delay(Math.min(index, 8) * 40)}>
      <Pressable onPress={() => router.push(`/products/${product.id}`)}>
        <PlaceholderTile caption="product shot" style={styles.cardImage} />
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
    paddingHorizontal: theme.spacing.gutter,
  },
  centerText: {
    textAlign: 'center',
  },
  mutedBody: {
    color: theme.colors.textSecondary,
  },
  screenPadding: {
    flex: 1,
    paddingHorizontal: 0,
  },
  title: {
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: 8,
    paddingBottom: 14,
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: 16,
  },
  searchInput: {
    height: 44,
    borderRadius: theme.radii.full,
  },
  chipRow: {
    gap: 8,
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: 22,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
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
  cardText: {
    gap: 2,
    paddingHorizontal: 2,
  },
  comingSoon: {
    paddingHorizontal: theme.spacing.gutter,
    gap: 8,
  },
});
