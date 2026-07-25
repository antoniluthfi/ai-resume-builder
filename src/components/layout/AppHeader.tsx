"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotePencilIcon as NotePencil } from "@phosphor-icons/react/dist/ssr/NotePencil";
import { SparkleIcon as Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { UndoButton } from "@/components/undo/UndoButton";
import { VersionsDrawer } from "@/components/versions/VersionsDrawer";
import { SettingsDrawer } from "@/components/providers/SettingsDrawer";
import { PdfDownloadButton } from "@/components/pdf/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/pdf/DocxDownloadButton";

const NAV_ITEMS = [
  { href: "/editor", label: "Editor", icon: NotePencil },
  { href: "/optimize", label: "Optimize", icon: Sparkle },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <NotePencil size={16} weight="bold" />
          </span>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight text-slate-900">AI Resume Builder</h1>
            <p className="hidden text-xs leading-tight text-slate-500 lg:block">
              ATS-friendly resume, tailored to every job description.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto sm:gap-2">
          <UndoButton />
          <VersionsDrawer />
          <SettingsDrawer />
          <DocxDownloadButton />
          <PdfDownloadButton />
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1680px] gap-1 px-4 sm:px-6" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={15} weight={active ? "fill" : "bold"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
