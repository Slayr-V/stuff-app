import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppButton, AppText, BottomSheet, Input, LoadingIndicator, theme } from '@/components';
import { getBoard, renameBoard } from '@/services/boards';

export default function RenameBoardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBoard(id)
      .then((board) => {
        if (!cancelled) setName(board?.name ?? '');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await renameBoard(id, trimmed);
      router.back();
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        setError('You already have a Board with that name.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not rename Board. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet title="Rename Board">
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          <Input
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {error ? (
            <AppText variant="caption" style={styles.error}>
              {error}
            </AppText>
          ) : null}
          <AppButton title="Save" onPress={handleSave} loading={submitting} disabled={!name.trim()} />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.danger,
  },
});
