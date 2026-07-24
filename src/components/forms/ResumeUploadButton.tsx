"use client";

import { useRef, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { ParsedResumeData } from "@/types/resume";
import { sectionClass, smallButtonClass } from "@/lib/formStyles";

export function ResumeUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadParsedResume = useResumeStore((s) => s.loadParsedResume);
  const hasExistingData = useResumeStore((s) => Boolean(s.resume.personalInfo.name || s.resume.experience.length));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

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
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Already have a resume?</h2>
          <p className="text-xs text-gray-500">Upload a PDF to auto-fill the form below.</p>
        </div>
        <button
          className={smallButtonClass}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Parsing…" : "Upload PDF"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
