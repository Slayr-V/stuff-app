import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Card, Icon, LoadingIndicator, PlaceholderTile, ScreenContainer, theme } from '@/components';
import { getProductWithFind, listBoardsForProduct } from '@/services/products';
import type { MatchType } from '@/types/database';

const MATCH_LABEL: Record<MatchType, string> = {
  exact_match: 'Exact match',
  likely_match: 'Likely match',
  mentioned: 'Mentioned',
  similar: 'Similar',
};

// Background/text pairs transcribed from the design's badge rules table.
// "mentioned" isn't in that table (it's a real match_type our schema
// produces that the mockup's 3-value example set didn't anticipate) —
// styled like "Similar" since it's evidence from the creator's own text,
// not a confirmed retailer match, so it shouldn't look more certain than
// that tier.
const MATCH_BADGE: Record<MatchType, { bg: string; fg: string }> = {
  exact_match: { bg: theme.colors.ink, fg: theme.colors.primaryText },
  likely_match: { bg: '#EDEDED', fg: '#3A3A3A' },
  similar: { bg: '#F5F5F5', fg: theme.colors.textSecondary },
  mentioned: { bg: '#F5F5F5', fg: theme.colors.textSecondary },
};

type ProductDetailData = Awaited<ReturnType<typeof getProductWithFind>>;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<ProductDetailData>(null);
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getProductWithFind(id), listBoardsForProduct(id)])
      .then(([productResult, boardsResult]) => {
        if (cancelled) return;
        setProduct(productResult);
        setBoards(boardsResult);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this product.');
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

  if (error || !product) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <AppText variant="emptyTitle" style={styles.centerText}>
          Couldn&apos;t load this product
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          {error ?? 'It may have been removed.'}
        </AppText>
      </ScreenContainer>
    );
  }

  const badge = product.match_type ? MATCH_BADGE[product.match_type] : null;

  return (
    <ScreenContainer edges={[]} contentContainerStyle={styles.flex} scroll>
      <View>
        <PlaceholderTile caption="product shot" radius={0} style={styles.heroImage} />
        <Pressable onPress={() => router.back()} style={[styles.roundButton, styles.backButton, { top: insets.top + 16 }]}>
          <BlurView intensity={30} tint="light" style={styles.roundButtonBlur} />
          <Icon name="back" size={15} color={theme.colors.ink} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleGroup}>
          <View style={styles.brandRow}>
            {product.brand ? <AppText variant="brandLabel">{product.brand}</AppText> : null}
            {product.match_type && badge ? (
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <AppText variant="matchBadge" style={{ color: badge.fg }}>
                  {MATCH_LABEL[product.match_type]}
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="sheetTitle">{product.name}</AppText>
        </View>

        <View style={styles.actions}>
          <AppButton title="Save to board" onPress={() => router.push(`/board-picker?productId=${product.id}`)} />
        </View>

        <Card style={styles.infoPanel} radius={theme.radii.panel}>
          <InfoRow label="Found via" value={formatPlatform(product.finds?.platform)} />
          {product.confidence !== null ? (
            <InfoRow label="Confidence" value={`${Math.round(product.confidence * 100)}%`} hairline />
          ) : null}
          <InfoRow label="In boards" value={boards.length > 0 ? boards.map((b) => b.name).join(', ') : 'Not saved yet'} hairline />
        </Card>

        {product.description ? (
          <View style={styles.descriptionGroup}>
            <AppText variant="sectionHeading">Description</AppText>
            <AppText variant="body" style={styles.mutedBody}>
              {product.description}
            </AppText>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

function InfoRow({ label, value, hairline }: { label: string; value: string; hairline?: boolean }) {
  return (
    <View style={[styles.infoRow, hairline && styles.infoRowHairline]}>
      <AppText variant="metadata">{label}</AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

function formatPlatform(platform: string | undefined): string {
  if (!platform) return 'Manual entry';
  if (platform === 'website' || platform === 'text') return 'Pasted content';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
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
  heroImage: {
    height: 420,
  },
  roundButton: {
    position: 'absolute',
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
  backButton: {
    left: 16,
  },
  content: {
    padding: theme.spacing.gutter,
    gap: 20,
  },
  titleGroup: {
    gap: 7,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radii.full,
  },
  actions: {
    gap: 10,
  },
  infoPanel: {
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 17,
  },
  infoRowHairline: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  descriptionGroup: {
    gap: 8,
  },
});
