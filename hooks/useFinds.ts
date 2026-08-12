import { useCallback, useEffect, useState } from 'react';

import { listFinds } from '@/services/finds';
import type { Find } from '@/types/database';

export function useFinds() {
  const [finds, setFinds] = useState<Find[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFinds(await listFinds());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Finds.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { finds, loading, error, refresh };
}
