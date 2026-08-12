import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { getFind, listProductsForFind } from '@/services/finds';
import type { Find, Product } from '@/types/database';

const MATCH_LABEL: Record<string, string> = {
  exact_match: 'Exact Match',
  likely_match: 'Likely Match',
  mentioned: 'Mentioned',
  similar: 'Similar',
};

export default function FindDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
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

  useLayoutEffect(() => {
    navigation.setOptions({ title: find?.platform ? find.platform.toUpperCase() : 'Find' });
  }, [navigation, find]);

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
        <AppText variant="title">Couldn&apos;t load this Find</AppText>
        <AppText variant="subtitle" style={styles.centerText}>
          {error ?? 'It may have been deleted.'}
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {find.caption ? <AppText variant="body">{find.caption}</AppText> : null}
        {find.source_url ? (
          <Pressable onPress={() => Linking.openURL(find.source_url!)}>
            <AppText variant="caption" style={styles.link} numberOfLines={1}>
              {find.source_url}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {products.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="subtitle" style={styles.centerText}>
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
  return (
    <Card style={styles.productCard}>
      <View style={styles.productHeader}>
        <AppText variant="label" style={styles.productName} numberOfLines={1}>
          {product.name}
        </AppText>
        {product.match_type ? (
          <AppText variant="caption" style={styles.matchBadge}>
            {MATCH_LABEL[product.match_type] ?? product.match_type}
          </AppText>
        ) : null}
      </View>
      {product.brand ? <AppText variant="caption">{product.brand}</AppText> : null}
      {product.description ? <AppText variant="subtitle">{product.description}</AppText> : null}
    </Card>
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
    gap: theme.spacing.md,
    flexGrow: 1,
  },
  header: {
    gap: theme.spacing.xs,
  },
  link: {
    color: theme.colors.primary,
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
    gap: theme.spacing.xs,
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
  matchBadge: {
    color: theme.colors.textMuted,
  },
});
