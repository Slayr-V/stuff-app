import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppButton, AppText, Input, ScreenContainer, theme } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { createBoard } from '@/services/boards';

export default function NewBoardScreen() {
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!session) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await createBoard(session.user.id, trimmed);
      router.back();
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        setError('You already have a Board with that name.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not create Board. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <Input
        label="Board name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Kitchen"
        autoFocus
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={handleCreate}
      />
      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
      <AppButton title="Create" onPress={handleCreate} loading={submitting} disabled={!name.trim()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    justifyContent: 'center',
    flexGrow: 1,
  },
  error: {
    color: theme.colors.danger,
  },
});
