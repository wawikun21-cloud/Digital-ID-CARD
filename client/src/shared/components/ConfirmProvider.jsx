import { createContext, useCallback, useContext, useRef, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'default', // 'default' | 'danger'
};

/**
 * App-wide replacement for window.confirm(). useConfirm() returns a
 * function that opens a styled modal and resolves to true/false:
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Log out', message: '...' })) { ... }
 *
 * Reads the same as the native dialog it replaces, but matches the
 * app's look and lets each caller word its own buttons.
 */
export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState(DEFAULTS);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setRequest({ ...DEFAULTS, ...options });
      setOpen(true);
    });
  }, []);

  function settle(result) {
    setOpen(false);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(result);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={open}
        title={request.title}
        message={request.message}
        confirmLabel={request.confirmLabel}
        cancelLabel={request.cancelLabel}
        tone={request.tone}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}