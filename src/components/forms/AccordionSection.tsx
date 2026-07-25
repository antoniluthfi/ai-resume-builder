"use client";

import { useState } from "react";
import { CaretDownIcon as CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { accordionBodyClass } from "@/lib/formStyles";

interface AccordionSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AccordionSection({
  title,
  description,
  defaultOpen = false,
  badge,
  actions,
  children,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((v) => !v);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [box-shadow:var(--shadow-card)]">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="truncate text-sm font-semibold text-slate-900">{title}</span>
          {badge}
          {description && (
            <span className="hidden truncate text-xs text-slate-400 sm:inline">{description}</span>
          )}
        </button>
        <span className="flex shrink-0 items-center gap-3">
          {actions}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-label={open ? "Collapse section" : "Expand section"}
            className="text-slate-400 hover:text-slate-600"
          >
            <CaretDown
              size={16}
              weight="bold"
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </span>
      </div>
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
