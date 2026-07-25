import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

const TOAST_DURATION_MS = 4000;

interface ToastState {
  toasts: Toast[];
  showToast: (variant: ToastVariant, message: string) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (variant, message) => {
    const id = Math.random().toString(36).slice(2, 10);
    set((state) => ({ toasts: [...state.toasts, { id, variant, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, TOAST_DURATION_MS);
  },

  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
