"use client";

import { useRef, useState } from "react";
import { UploadSimpleIcon as UploadSimple } from "@phosphor-icons/react/dist/ssr/UploadSimple";
import { useResumeStore } from "@/store/resumeStore";
import { ParsedResumeData } from "@/types/resume";
import { secondaryButtonClass, sectionClass } from "@/lib/formStyles";

export function ResumeUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadParsedResume = useResumeStore((s) => s.loadParsedResume);
  const hasExistingData = useResumeStore((s) => Boolean(s.resume.personalInfo.name || s.resume.experience.length));
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const apiKey = useResumeStore((s) => s.providerKeys[s.selectedProvider]) ?? "";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !apiKey) return;

    if (
      hasExistingData &&
      !window.confirm("This will replace the resume data currently in the form. Continue?")
    ) {
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("provider", selectedProvider);
      formData.append("apiKey", apiKey);
      const response = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to parse resume");
      }
      loadParsedResume(data as ParsedResumeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse resume");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${sectionClass}`}>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Already have a resume?</h2>
        <p className="text-xs text-slate-500">Upload a PDF to auto-fill the form below.</p>
      </div>
      <button
        className={`shrink-0 self-start sm:self-auto ${secondaryButtonClass}`}
        onClick={() => inputRef.current?.click()}
        disabled={isUploading || !apiKey}
      >
        <UploadSimple size={16} weight="bold" />
        {isUploading ? "Parsing…" : "Upload PDF"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="w-full text-xs text-rose-600">{error}</p>}
    </div>
  );
}
