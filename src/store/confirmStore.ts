import { create } from "zustand";

interface PendingConfirm {
  message: string;
  resolve: (value: boolean) => void;
}

interface ConfirmState {
  pending: PendingConfirm | null;
  requestConfirm: (message: string) => Promise<boolean>;
  resolve: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  pending: null,

  requestConfirm: (message) =>
    new Promise<boolean>((resolve) => {
      set({ pending: { message, resolve } });
    }),

  resolve: (value) => {
    get().pending?.resolve(value);
    set({ pending: null });
  },
}));

export function confirmDialog(message: string): Promise<boolean> {
  return useConfirmStore.getState().requestConfirm(message);
}
