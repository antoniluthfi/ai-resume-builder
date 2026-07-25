"use client";

import { useState } from "react";
import { CaretDownIcon as CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { accordionBodyClass } from "@/lib/formStyles";

interface AccordionSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function AccordionSection({
  title,
  description,
  defaultOpen = false,
  badge,
  children,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [box-shadow:var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">{title}</span>
          {badge}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {description && (
            <span className="hidden text-xs text-slate-400 sm:inline">{description}</span>
          )}
          <CaretDown
            size={16}
            weight="bold"
            className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={accordionBodyClass}>{children}</div>
        </div>
      </div>
    </div>
  );
}
