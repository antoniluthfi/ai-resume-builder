"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { AppHeader } from "./AppHeader";
import { PreviewPane } from "./PreviewPane";
import { ResumeScoreCard } from "@/components/quality/ResumeScoreCard";

export function BuilderShell({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useResumeStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto flex max-w-[1680px] flex-col gap-6 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-4">
          <ResumeScoreCard />
          {children}
        </div>
        <PreviewPane />
      </main>
    </div>
  );
}
