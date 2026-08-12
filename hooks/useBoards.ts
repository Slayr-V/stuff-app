import { useCallback, useEffect, useState } from 'react';

import { listBoards } from '@/services/boards';
import type { Board } from '@/types/database';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBoards(await listBoards());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Boards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { boards, loading, error, refresh };
}
