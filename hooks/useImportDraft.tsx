import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import type { ExtractedProduct } from '@/services/imports';

export type ImportDraft = {
  caption: string;
  sourceUrl: string;
  products: ExtractedProduct[];
  // Parallel to products — false means "leave this out of Save". Reset to
  // all-true whenever setProducts runs (a fresh analysis result).
  included: boolean[];
};

const EMPTY_DRAFT: ImportDraft = { caption: '', sourceUrl: '', products: [], included: [] };

type ImportDraftContextValue = {
  draft: ImportDraft;
  setCaption: (value: string) => void;
  setSourceUrl: (value: string) => void;
  setProducts: (products: ExtractedProduct[]) => void;
  toggleIncluded: (index: number) => void;
  reset: () => void;
};

const ImportDraftContext = createContext<ImportDraftContextValue | null>(null);

// Shared state across the linear Add-sheet -> Describe -> Analysing ->
// Results flow. Lives at the root (mounted for the whole app, like
// AuthProvider/ToastProvider) rather than scoped to a nested navigator —
// the import screens are flat sibling routes in the root Stack (see
// app/_layout.tsx), not a nested Stack, so a root-level provider is the
// simplest way to share this without threading params through the URL.
export function ImportDraftProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<ImportDraft>(EMPTY_DRAFT);

  const setCaption = useCallback((value: string) => {
    setDraft((current) => ({ ...current, caption: value }));
  }, []);

  const setSourceUrl = useCallback((value: string) => {
    setDraft((current) => ({ ...current, sourceUrl: value }));
  }, []);

  const setProducts = useCallback((products: ExtractedProduct[]) => {
    setDraft((current) => ({ ...current, products, included: products.map(() => true) }));
  }, []);

  const toggleIncluded = useCallback((index: number) => {
    setDraft((current) => ({
      ...current,
      included: current.included.map((value, i) => (i === index ? !value : value)),
    }));
  }, []);

  const reset = useCallback(() => setDraft(EMPTY_DRAFT), []);

  const value = useMemo(
    () => ({ draft, setCaption, setSourceUrl, setProducts, toggleIncluded, reset }),
    [draft, setCaption, setSourceUrl, setProducts, toggleIncluded, reset],
  );

  return <ImportDraftContext.Provider value={value}>{children}</ImportDraftContext.Provider>;
}

export function useImportDraft(): ImportDraftContextValue {
  const context = useContext(ImportDraftContext);
  if (!context) {
    throw new Error('useImportDraft must be used within an ImportDraftProvider');
  }
  return context;
}
