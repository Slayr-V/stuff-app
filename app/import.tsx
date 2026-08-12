import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, Input, LoadingIndicator, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { analyzeFind, saveFindWithProducts, type ExtractedProduct } from '@/services/imports';

type Step = 'form' | 'analyzing' | 'reviewing' | 'saving';

// Manual import: paste the post's caption + an optional source link (see
// supabase/functions/analyze-find for why this doesn't try to scrape the
// URL itself) -> AI extracts candidate products -> the user reviews and
// edits the draft before anything is saved as a real Find/Products. This
// review step is the whole point — never silently trust AI output.
export default function ImportScreen() {
  const { session } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [caption, setCaption] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [draftProducts, setDraftProducts] = useState<ExtractedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const trimmedCaption = caption.trim();
    if (!trimmedCaption) return;

    setStep('analyzing');
    setError(null);
    try {
      const products = await analyzeFind({ caption: trimmedCaption, sourceUrl: sourceUrl.trim() });
      setDraftProducts(products);
      setStep('reviewing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not analyse this content. Try again.');
      setStep('form');
    }
  }

  async function handleSave() {
    if (!session) return;

    setStep('saving');
    setError(null);
    try {
      await saveFindWithProducts({
        userId: session.user.id,
        platform: sourceUrl.trim() ? 'website' : 'text',
        caption: caption.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        products: draftProducts,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this Find. Try again.');
      setStep('reviewing');
    }
  }

  function updateDraftProduct(index: number, patch: Partial<ExtractedProduct>) {
    setDraftProducts((current) => current.map((product, i) => (i === index ? { ...product, ...patch } : product)));
  }

  function removeDraftProduct(index: number) {
    setDraftProducts((current) => current.filter((_, i) => i !== index));
  }

  if (step === 'analyzing') {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <LoadingIndicator label="Reading the caption for products…" />
      </ScreenContainer>
    );
  }

  if (step === 'reviewing' || step === 'saving') {
    return (
      <ScreenContainer scroll contentContainerStyle={styles.reviewContainer}>
        <AppText variant="title">Review before saving</AppText>
        <AppText variant="subtitle">
          {draftProducts.length === 0
            ? "No products found in that caption — you can save the Find on its own, or go back and edit the caption."
            : 'Edit or remove anything that looks wrong. Nothing is saved until you tap Save.'}
        </AppText>

        {draftProducts.map((product, index) => (
          <Card key={index} style={styles.productCard}>
            <Input label="Name" value={product.name} onChangeText={(value) => updateDraftProduct(index, { name: value })} />
            <Input
              label="Brand"
              value={product.brand ?? ''}
              onChangeText={(value) => updateDraftProduct(index, { brand: value || null })}
            />
            <Input
              label="Category"
              value={product.category ?? ''}
              onChangeText={(value) => updateDraftProduct(index, { category: value || null })}
            />
            <Input
              label="Description"
              value={product.description ?? ''}
              onChangeText={(value) => updateDraftProduct(index, { description: value || null })}
            />
            <AppButton title="Remove" variant="ghost" onPress={() => removeDraftProduct(index)} />
          </Card>
        ))}

        {error ? (
          <AppText variant="caption" style={styles.error}>
            {error}
          </AppText>
        ) : null}

        <View style={styles.reviewActions}>
          <AppButton title="Back" variant="secondary" onPress={() => setStep('form')} style={styles.actionButton} />
          <AppButton
            title={draftProducts.length === 0 ? 'Save Find' : `Save ${draftProducts.length} product${draftProducts.length === 1 ? '' : 's'}`}
            loading={step === 'saving'}
            onPress={handleSave}
            style={styles.actionButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.formContainer}>
      <AppText variant="title">Import a Find</AppText>
      <AppText variant="subtitle">
        Paste the caption or description from the post, plus a link if you have one. Screenshot and video import
        come later.
      </AppText>

      <Input
        label="Caption / description"
        value={caption}
        onChangeText={setCaption}
        placeholder="Paste the post's caption here…"
        multiline
        numberOfLines={6}
        style={styles.captionInput}
      />
      <Input
        label="Source link (optional)"
        value={sourceUrl}
        onChangeText={setSourceUrl}
        placeholder="https://…"
        autoCapitalize="none"
        keyboardType="url"
      />

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <AppButton title="Analyse" onPress={handleAnalyze} disabled={!caption.trim()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  formContainer: {
    gap: theme.spacing.md,
  },
  captionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  reviewContainer: {
    gap: theme.spacing.md,
  },
  productCard: {
    gap: theme.spacing.sm,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  error: {
    color: theme.colors.danger,
  },
});
