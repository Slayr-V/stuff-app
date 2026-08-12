import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, Card, Input, ScreenContainer, theme } from '@/components';
import { useImportDraft } from '@/hooks/useImportDraft';

// The real form behind both "Paste a link or screenshot" and "Describe
// it" — this app can't scrape a URL or read a screenshot's pixels, so
// both paths end up asking for the same two things: the caption/
// description text analyze-find actually reads, and an optional source
// link kept only as a reference on the saved Find. `mode` just changes
// which field is framed as primary and the header copy, matching which
// row the user tapped — it doesn't change what's submitted.
export default function DescribeScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isPaste = mode === 'paste';
  const { draft, setCaption, setSourceUrl } = useImportDraft();
  const [caption, setLocalCaption] = useState(draft.caption);
  const [sourceUrl, setLocalSourceUrl] = useState(draft.sourceUrl);

  function handleSubmit() {
    const trimmedCaption = caption.trim();
    if (!trimmedCaption) return;
    setCaption(trimmedCaption);
    setSourceUrl(sourceUrl.trim());
    router.push('/import/analyzing');
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <AppText variant="body" style={styles.cancel}>
            Cancel
          </AppText>
        </Pressable>
        <AppText variant="navTitle">{isPaste ? 'Paste a link' : 'Describe it'}</AppText>
        <View style={styles.navSpacer} />
      </View>

      <Card style={styles.panel} radius={theme.radii.panel}>
        {isPaste ? (
          <>
            <Input
              label="Link"
              value={sourceUrl}
              onChangeText={setLocalSourceUrl}
              placeholder="https://…"
              autoCapitalize="none"
              autoFocus
              keyboardType="url"
            />
            <Input
              label="Caption"
              value={caption}
              onChangeText={setLocalCaption}
              placeholder="Paste the post's caption or screenshot text here…"
              multiline
              numberOfLines={5}
              style={styles.captionInput}
            />
          </>
        ) : (
          <>
            <Input
              label="Description"
              value={caption}
              onChangeText={setLocalCaption}
              placeholder="the ribbed cream vase from that reel…"
              multiline
              numberOfLines={5}
              autoFocus
              style={styles.captionInput}
            />
            <Input
              label="Link (optional)"
              value={sourceUrl}
              onChangeText={setLocalSourceUrl}
              placeholder="https://…"
              autoCapitalize="none"
              keyboardType="url"
            />
          </>
        )}
      </Card>

      <AppButton title="Find the products" onPress={handleSubmit} disabled={!caption.trim()} />
      <AppText variant="metadata" style={styles.hint}>
        Usually takes about 10 seconds
      </AppText>
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
  cancel: {
    color: theme.colors.textSecondary,
  },
  navSpacer: {
    width: 50,
  },
  panel: {
    gap: theme.spacing.md,
  },
  captionInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  hint: {
    textAlign: 'center',
  },
});
