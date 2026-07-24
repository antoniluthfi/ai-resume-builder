"use client";

import { useRef, useState } from "react";
import { BackupData, useResumeStore } from "@/store/resumeStore";
import { inputClass, labelClass, primaryButtonClass, removeButtonClass, smallButtonClass } from "@/lib/formStyles";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function isBackupData(value: unknown): value is BackupData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.resume === "object" && v.resume !== null && Array.isArray(v.versions);
}

export function VersionsPanel() {
  const versions = useResumeStore((s) => s.versions);
  const saveVersion = useResumeStore((s) => s.saveVersion);
  const loadVersion = useResumeStore((s) => s.loadVersion);
  const deleteVersion = useResumeStore((s) => s.deleteVersion);
  const exportBackup = useResumeStore((s) => s.exportBackup);
  const restoreBackup = useResumeStore((s) => s.restoreBackup);
  const [name, setName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveVersion(trimmed);
    setName("");
  }

  function handleExport() {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-resume-builder-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isBackupData(parsed)) {
          setImportError("This file doesn't look like a valid backup.");
          return;
        }
        if (!window.confirm("This will replace your current resume and saved versions. Continue?")) {
          return;
        }
        restoreBackup(parsed);
      } catch {
        setImportError("Couldn't read that file as JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Save current resume + job description as a version</label>
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="e.g. Acme Corp - Frontend Engineer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button className={`shrink-0 ${primaryButtonClass}`} onClick={handleSave} disabled={!name.trim()}>
            Save
          </button>
        </div>
      </div>

      <div>
        <p className={labelClass}>Saved versions</p>
        {versions.length === 0 ? (
          <p className="text-xs text-gray-400">No versions saved yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="rounded-md border border-gray-100 p-2">
                <p className="text-xs font-medium text-gray-800">{v.name}</p>
                <p className="text-[11px] text-gray-400">{formatDate(v.createdAt)}</p>
                {v.jobDescription && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 italic">{v.jobDescription}</p>
                )}
                <div className="mt-2 flex gap-3">
                  <button className={smallButtonClass} onClick={() => loadVersion(v.id)}>
                    Load
                  </button>
                  <button className={removeButtonClass} onClick={() => deleteVersion(v.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className={labelClass}>Backup</p>
        <div className="flex gap-3">
          <button className={smallButtonClass} onClick={handleExport}>
            Export as JSON
          </button>
          <button className={smallButtonClass} onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
        {importError && <p className="mt-1 text-xs text-red-600">{importError}</p>}
        <p className="mt-2 text-[11px] text-gray-400">
          Backup includes your resume and saved versions only — never your API keys.
        </p>
      </div>
    </div>
  );
}
