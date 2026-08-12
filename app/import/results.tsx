import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Icon, PlaceholderTile, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useImportDraft } from '@/hooks/useImportDraft';
import { useToast } from '@/hooks/useToast';
import { saveFindWithProducts } from '@/services/imports';

// Every extracted product came straight from the creator's own caption
// text, not a confirmed retailer match — saveFindWithProducts always
// tags them match_type: 'mentioned'. No price or product URL exists
// anywhere in this pipeline yet, so this screen doesn't show either;
// showing a price here would mean inventing one. The per-row action is a
// lightweight include/exclude toggle rather than the design's per-item
// board-picker — assigning to a board happens after saving, from Product
// Detail, once the product actually exists as a row to attach to.
export default function ResultsScreen() {
  const { session } = useAuth();
  const { draft, reset } = useImportDraft();
  const { show } = useToast();
  const [included, setIncluded] = useState<boolean[]>(draft.included);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const includedCount = included.filter(Boolean).length;

  function toggle(index: number) {
    setIncluded((current) => current.map((value, i) => (i === index ? !value : value)));
  }

  async function handleSave() {
    if (!session) return;

    setSaving(true);
    setError(null);
    try {
      const productsToSave = draft.products.filter((_, i) => included[i]);
      await saveFindWithProducts({
        userId: session.user.id,
        platform: draft.sourceUrl ? 'website' : 'text',
        caption: draft.caption,
        sourceUrl: draft.sourceUrl || undefined,
        products: productsToSave,
      });
      reset();
      router.dismissAll();
      show(productsToSave.length > 0 ? `Saved ${productsToSave.length} product${productsToSave.length === 1 ? '' : 's'}` : 'Saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this Find. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.navRow}>
        <Pressable onPress={() => router.dismissAll()} style={styles.closeButton} hitSlop={6}>
          <Icon name="close" size={13} color={theme.colors.ink} strokeWidth={1.6} />
        </Pressable>
        <AppText variant="navTitle">
          {draft.products.length} product{draft.products.length === 1 ? '' : 's'} found
        </AppText>
        <Pressable onPress={handleSave} disabled={saving || includedCount === 0} hitSlop={6}>
          <AppText variant="label" style={includedCount === 0 ? styles.saveAllDisabled : undefined}>
            Save all
          </AppText>
        </Pressable>
      </View>

      <View style={styles.sourceRow}>
        <AppText variant="metadata" numberOfLines={2}>
          {draft.caption}
        </AppText>
        {draft.sourceUrl ? (
          <AppText variant="metadata" numberOfLines={1} style={styles.sourceUrl}>
            {draft.sourceUrl}
          </AppText>
        ) : null}
      </View>

      {draft.products.length === 0 ? (
        <AppText variant="body" style={styles.mutedBody}>
          No products found in that description — you can save the Find on its own, or describe it again.
        </AppText>
      ) : (
        <View style={styles.list}>
          {draft.products.map((product, index) => (
            <View key={index} style={[styles.productRow, !included[index] && styles.productRowExcluded]}>
              <PlaceholderTile caption="product" style={styles.thumb} />
              <View style={styles.productText}>
                <View style={styles.badgeRow}>
                  {product.brand ? <AppText variant="brandLabel">{product.brand}</AppText> : null}
                  <View style={styles.badge}>
                    <AppText variant="matchBadge" style={styles.badgeText}>
                      Mentioned
                    </AppText>
                  </View>
                </View>
                <AppText variant="cardName" numberOfLines={2}>
                  {product.name}
                </AppText>
              </View>
              <Pressable onPress={() => toggle(index)} style={styles.toggle} hitSlop={6}>
                {included[index] ? (
                  <Icon name="checkmark" size={14} color={theme.colors.ink} strokeWidth={2} />
                ) : (
                  <View style={styles.toggleRing} />
                )}
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <AppButton
        title={includedCount === 0 ? 'Save Find' : `Save ${includedCount} product${includedCount === 1 ? '' : 's'}`}
        onPress={handleSave}
        loading={saving}
      />

      <Pressable onPress={() => router.push('/import/describe')} style={styles.footerLink}>
        <AppText variant="metadata" style={styles.footerLinkText}>
          Something missing? Describe it and stuff will look again.
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAllDisabled: {
    color: theme.colors.textTertiary,
  },
  sourceRow: {
    gap: 2,
  },
  sourceUrl: {
    color: theme.colors.textTertiary,
  },
  mutedBody: {
    color: theme.colors.textSecondary,
  },
  list: {
    gap: theme.spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  productRowExcluded: {
    opacity: 0.4,
  },
  thumb: {
    width: 104,
    height: 104,
  },
  productText: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F5F5F5',
    borderRadius: theme.radii.full,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  badgeText: {
    color: theme.colors.textSecondary,
  },
  toggle: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRing: {
    width: 18,
    height: 18,
    borderRadius: theme.radii.full,
    borderWidth: 1.6,
    borderColor: theme.colors.dashed,
  },
  error: {
    color: theme.colors.danger,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  footerLinkText: {
    textAlign: 'center',
    color: theme.colors.textTertiary,
  },
});
