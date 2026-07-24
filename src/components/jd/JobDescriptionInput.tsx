"use client";

import { inputClass, sectionClass, sectionTitleClass } from "@/lib/formStyles";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <div className={sectionClass}>
      <h2 className={sectionTitleClass}>Job Description</h2>
      <textarea
        className={inputClass}
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here to check keyword match and get tailoring suggestions."
      />
    </div>
  );
}
