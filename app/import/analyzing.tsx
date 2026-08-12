import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Icon, PlaceholderTile, ScreenContainer, Spinner, theme } from '@/components';
import { useImportDraft } from '@/hooks/useImportDraft';
import { analyzeFind } from '@/services/imports';

type Step = 'reading' | 'matching' | 'done';

// The design calls for a ~2.2s fixed timer here in the prototype but is
// explicit that production should "drive it from the analyze-find edge
// function status" — so this screen's checklist reflects a real request
// in flight, not a fake clock. Step 1 is checked immediately (the caption
// text is already in hand, no work to do). Step 2's spinner spans the
// actual analyzeFind() call. Step 3 checks the instant a real response
// arrives, right before navigating to Results.
export default function AnalyzingScreen() {
  const { draft, setProducts } = useImportDraft();
  const [step, setStep] = useState<Step>('reading');
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    setStep('reading');
    const readingDelay = setTimeout(() => setStep('matching'), 250);

    analyzeFind({ caption: draft.caption, sourceUrl: draft.sourceUrl || undefined })
      .then((products) => {
        setStep('done');
        setProducts(products);
        router.replace('/import/results');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not analyse this content. Try again.');
      });

    return () => clearTimeout(readingDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <PlaceholderTile caption="source" radius={34} style={styles.preview} />
        <AppText variant="analysingTitle" style={styles.centerText}>
          Couldn&apos;t read that
        </AppText>
        <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
          {error}
        </AppText>
        <AppButton title="Try again" onPress={() => router.back()} style={styles.retryButton} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <PlaceholderTile caption="source" radius={34} style={styles.preview} />
      <AppText variant="analysingTitle" style={styles.centerText}>
        Reading what you shared
      </AppText>
      <AppText variant="body" style={[styles.centerText, styles.mutedBody]}>
        Looking for products, brands and prices
      </AppText>

      <View style={styles.checklist}>
        <ChecklistRow label="Reading your description" state={step === 'reading' ? 'active' : 'done'} />
        <ChecklistRow
          label="Matching products"
          state={step === 'reading' ? 'pending' : step === 'matching' ? 'active' : 'done'}
        />
        <ChecklistRow label="Almost done" state={step === 'done' ? 'done' : 'pending'} />
      </View>
    </ScreenContainer>
  );
}

function ChecklistRow({ label, state }: { label: string; state: 'pending' | 'active' | 'done' }) {
  return (
    <View style={styles.checklistRow}>
      {state === 'done' ? (
        <View style={styles.checkDot}>
          <Icon name="checkmark" size={10} color={theme.colors.primaryText} strokeWidth={2.2} />
        </View>
      ) : state === 'active' ? (
        <Spinner size={16} />
      ) : (
        <View style={styles.pendingRing} />
      )}
      <AppText variant="body" style={state === 'pending' ? styles.pendingLabel : undefined}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  centerText: {
    textAlign: 'center',
  },
  mutedBody: {
    color: theme.colors.textSecondary,
  },
  preview: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.md,
  },
  checklist: {
    marginTop: theme.spacing.lg,
    gap: 14,
    alignSelf: 'stretch',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingRing: {
    width: 16,
    height: 16,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    borderColor: theme.colors.hairline,
  },
  pendingLabel: {
    color: '#B5B5B5',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
  },
});
