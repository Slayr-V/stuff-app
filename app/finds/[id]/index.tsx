import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { getFind, listProductsForFind } from '@/services/finds';
import type { Find, MatchType, Product } from '@/types/database';

// Not reachable from the current navigation — the Finds tab now opens
// Product Detail (app/products/[id].tsx) for a single product, and there
// is no remaining link to "this whole Find, all its products" anywhere
// in the redesigned flow. Kept registered (see app/_layout.tsx) and
// restyled to the current tokens rather than deleted, since the route
// still works and a future "view the original post" entry point would
// want it. See MATCH_BADGE in products/[id].tsx for the same badge rules.
const MATCH_BADGE: Record<MatchType, { bg: string; fg: string }> = {
  exact_match: { bg: theme.colors.ink, fg: theme.colors.primaryText },
  likely_match: { bg: '#EDEDED', fg: '#3A3A3A' },
  similar: { bg: '#F5F5F5', fg: theme.colors.textSecondary },
  mentioned: { bg: '#F5F5F5', fg: theme.colors.textSecondary },
};

const MATCH_LABEL: Record<MatchType, string> = {
  exact_match: 'Exact match',
  likely_match: 'Likely match',
  mentioned: 'Mentioned',
  similar: 'Similar',
};

export default function FindDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [find, setFind] = useState<Find | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getFind(id), listProductsForFind(id)])
      .then(([findResult, productsResult]) => {
        if (cancelled) return;
        setFind(findResult);
        setProducts(productsResult);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this Find.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator />
      </ScreenContainer>
    );
  }

  if (error || !find) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="emptyTitle" style={styles.centerText}>
          Couldn&apos;t load this Find
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          {error ?? 'It may have been deleted.'}
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={6}>
          <Icon name="close" size={13} color={theme.colors.ink} strokeWidth={1.6} />
        </Pressable>
        <AppText variant="navTitle">{formatPlatform(find.platform)}</AppText>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.header}>
        {find.caption ? <AppText variant="body">{find.caption}</AppText> : null}
        {find.source_url ? (
          <Pressable onPress={() => Linking.openURL(find.source_url!)}>
            <AppText variant="metadata" style={styles.link} numberOfLines={1}>
              {find.source_url}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {products.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
            No products identified in this Find.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(product) => product.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}
    </ScreenContainer>
  );
}

function ProductCard({ product }: { product: Product }) {
  const badge = product.match_type ? MATCH_BADGE[product.match_type] : null;
  return (
    <Card style={styles.productCard} radius={theme.radii.panel}>
      <View style={styles.productHeader}>
        <AppText variant="boardCardTitle" style={styles.productName} numberOfLines={1}>
          {product.name}
        </AppText>
        {product.match_type && badge ? (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <AppText variant="matchBadge" style={{ color: badge.fg }}>
              {MATCH_LABEL[product.match_type]}
            </AppText>
          </View>
        ) : null}
      </View>
      {product.brand ? <AppText variant="brandLabel">{product.brand}</AppText> : null}
      {product.description ? (
        <AppText variant="body" style={styles.mutedBody}>
          {product.description}
        </AppText>
      ) : null}
    </Card>
  );
}

function formatPlatform(platform: string): string {
  if (platform === 'website' || platform === 'text') return 'Pasted content';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
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
  container: {
    gap: theme.spacing.md,
    flexGrow: 1,
    padding: theme.spacing.gutter,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSpacer: {
    width: 38,
  },
  header: {
    gap: 4,
  },
  link: {
    color: theme.colors.textTertiary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: theme.spacing.sm,
  },
  productCard: {
    gap: 6,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  productName: {
    flex: 1,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radii.full,
  },
});
