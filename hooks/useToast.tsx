import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, theme } from '@/components';

type ToastState = { message: string; onUndo?: () => void } | null;

type ToastContextValue = {
  show: (message: string, onUndo?: () => void) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 2600;

// Global toast — "Saved to {board}" + optional Undo, matching the design.
// Lives at the root so it can render above the tab bar/FAB from anywhere
// (board-picker, results, product detail all trigger it).
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, onUndo?: () => void) => {
    setToast({ message, onUndo });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  function handleUndo() {
    toast?.onUndo?.();
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <View style={[styles.toast, { bottom: insets.bottom + 112 }]} pointerEvents="box-none">
          <View style={styles.checkCircle}>
            <Icon name="checkmark" size={12} color={theme.colors.ink} strokeWidth={2} />
          </View>
          <AppText variant="body" style={styles.message}>
            {toast.message}
          </AppText>
          {toast.onUndo ? (
            <AppText variant="body" style={styles.undo} onPress={handleUndo}>
              Undo
            </AppText>
          ) : null}
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: theme.colors.ink,
    borderRadius: theme.radii.panel,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    ...theme.shadows.toast,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    color: theme.colors.primaryText,
  },
  undo: {
    color: theme.colors.primaryText,
    opacity: 0.6,
  },
});
