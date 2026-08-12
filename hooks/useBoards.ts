import { useCallback, useEffect, useState } from 'react';

import { listBoardProductCounts, listBoards } from '@/services/boards';
import type { Board } from '@/types/database';

export type BoardWithCount = Board & { itemCount: number };

export function useBoards() {
  const [boards, setBoards] = useState<BoardWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [boardRows, counts] = await Promise.all([listBoards(), listBoardProductCounts()]);
      setBoards(boardRows.map((board) => ({ ...board, itemCount: counts[board.id] ?? 0 })));
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
