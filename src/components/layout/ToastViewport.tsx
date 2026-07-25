"use client";

import { CheckCircleIcon as CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { XCircleIcon as XCircle } from "@phosphor-icons/react/dist/ssr/XCircle";
import { InfoIcon as Info } from "@phosphor-icons/react/dist/ssr/Info";
import { XIcon as X } from "@phosphor-icons/react/dist/ssr/X";
import { Toast, ToastVariant, useToastStore } from "@/store/toastStore";

const VARIANT_STYLES: Record<ToastVariant, { border: string; bg: string; icon: React.ReactNode }> = {
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: <CheckCircle size={18} weight="fill" className="text-emerald-500" />,
  },
  error: {
    border: "border-rose-200",
    bg: "bg-rose-50",
    icon: <XCircle size={18} weight="fill" className="text-rose-500" />,
  },
  info: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    icon: <Info size={18} weight="fill" className="text-blue-500" />,
  },
};

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { border, bg, icon } = VARIANT_STYLES[toast.variant];
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border ${border} ${bg} px-3 py-2.5 shadow-lg [box-shadow:var(--shadow-card)]`}
    >
      {icon}
      <p className="min-w-0 flex-1 text-sm text-slate-700">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-slate-400 hover:text-slate-600"
      >
        <X size={14} weight="bold" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}
