import { useState, useEffect, useCallback } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function useToast(duration = 2500) {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  return { toast, showToast };
}
