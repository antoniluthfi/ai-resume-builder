"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { inputClass, primaryButtonClass, sectionClass, sectionTitleClass, smallButtonClass } from "@/lib/formStyles";

export function CoverLetterPanel({ jobDescription }: { jobDescription: string }) {
  const resume = useResumeStore((s) => s.resume);
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const apiKey = useResumeStore((s) => s.providerKeys[s.selectedProvider]) ?? "";
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!apiKey) return;
    setIsGenerating(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume, provider: selectedProvider, apiKey }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Cover letter generation failed");
      }
      setCoverLetter(data.coverLetter ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Cover Letter</h2>
        <button
          className={primaryButtonClass}
          onClick={handleGenerate}
          disabled={isGenerating || !jobDescription.trim() || !apiKey}
        >
          {isGenerating ? "Generating…" : "Generate Cover Letter"}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {coverLetter && (
        <div className="space-y-2">
          <textarea
            className={inputClass}
            rows={10}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          <div className="flex gap-3">
            <button className={smallButtonClass} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button className={smallButtonClass} onClick={handleDownload}>
              Download .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
