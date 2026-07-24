"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { buildResumeDocx } from "@/lib/docx/buildResumeDocx";
import { primaryButtonClass } from "@/lib/formStyles";

export function DocxDownloadButton() {
  const resume = useResumeStore((s) => s.resume);
  const hiddenProjectIds = useResumeStore((s) => s.hiddenProjectIds);
  const [isPreparing, setIsPreparing] = useState(false);

  async function handleDownload() {
    setIsPreparing(true);
    try {
      const { Packer } = await import("docx");
      const exportResume = {
        ...resume,
        projects: resume.projects.filter((p) => !hiddenProjectIds.includes(p.id)),
      };
      const doc = buildResumeDocx(exportResume);
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.personalInfo.name || "resume"}.docx`.replace(/\s+/g, "_");
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <button className={primaryButtonClass} onClick={handleDownload} disabled={isPreparing}>
      {isPreparing ? "Preparing DOCX…" : "Download DOCX"}
    </button>
  );
}
