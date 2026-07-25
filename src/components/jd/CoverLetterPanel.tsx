"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useToastStore } from "@/store/toastStore";
import { inputClass, primaryButtonClass, smallButtonClass } from "@/lib/formStyles";
import { AccordionSection } from "@/components/forms/AccordionSection";

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function CoverLetterPanel({ jobDescription }: { jobDescription: string }) {
  const resume = useResumeStore((s) => s.resume);
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const apiKey = useResumeStore((s) => s.providerKeys[s.selectedProvider]) ?? "";
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const showToast = useToastStore((s) => s.showToast);

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
      if (!recipientEmail.trim()) {
        const match = jobDescription.match(EMAIL_PATTERN);
        if (match) setRecipientEmail(match[0]);
      }
      showToast("success", "Cover letter generated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cover letter generation failed";
      setError(message);
      showToast("error", message);
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

  function handleComposeEmail() {
    const subject = `Application${resume.personalInfo.title ? ` for ${resume.personalInfo.title}` : ""} — ${resume.personalInfo.name || ""}`;
    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(coverLetter)}`;
    window.location.href = mailto;
  }

  return (
    <AccordionSection
      title="Cover Letter"
      actions={
        <button
          className={primaryButtonClass}
          onClick={handleGenerate}
          disabled={isGenerating || !jobDescription.trim() || !apiKey}
        >
          {isGenerating ? "Generating…" : "Generate Cover Letter"}
        </button>
      }
    >
      {error && <p className="text-xs text-rose-600">{error}</p>}

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

          <div className="rounded-lg border border-slate-100 p-3 space-y-2">
            <label className="block text-xs font-medium text-slate-600">Send via email</label>
            <div className="flex gap-2">
              <input
                type="email"
                className={inputClass}
                placeholder="recruiter@company.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <button
                className={`shrink-0 ${primaryButtonClass}`}
                onClick={handleComposeEmail}
                disabled={!recipientEmail.trim()}
              >
                Compose Email
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Opens your default email app with the subject and this letter filled in. Browsers can&apos;t
              attach files automatically — remember to attach your downloaded PDF/DOCX in the compose
              window that opens.
            </p>
          </div>
        </div>
      )}
    </AccordionSection>
  );
}
