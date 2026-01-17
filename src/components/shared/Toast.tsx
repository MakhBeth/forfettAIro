import { Check, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType } from '../../types';

interface ToastProps {
  toast: ToastType | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
      <span>{toast.message}</span>
    </div>
  );
}
