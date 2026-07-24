"use client";

import { useResumeStore } from "@/store/resumeStore";
import {
  inputClass,
  labelClass,
  removeButtonClass,
  sectionClass,
  sectionTitleClass,
  smallButtonClass,
} from "@/lib/formStyles";

export function CertificationsForm() {
  const certifications = useResumeStore((s) => s.resume.certifications);
  const addCertification = useResumeStore((s) => s.addCertification);
  const updateCertification = useResumeStore((s) => s.updateCertification);
  const removeCertification = useResumeStore((s) => s.removeCertification);

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Certifications (optional)</h2>
        <button className={smallButtonClass} onClick={addCertification}>
          + Add certification
        </button>
      </div>

      {certifications.map((entry) => (
        <div key={entry.id} className="grid grid-cols-3 gap-2 rounded-md border border-gray-100 p-3">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={entry.name}
              onChange={(e) => updateCertification(entry.id, { name: e.target.value })}
              placeholder="AWS Certified Developer"
            />
          </div>
          <div>
            <label className={labelClass}>Issuer</label>
            <input
              className={inputClass}
              value={entry.issuer ?? ""}
              onChange={(e) => updateCertification(entry.id, { issuer: e.target.value })}
              placeholder="Amazon"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className={labelClass}>Date</label>
              <input
                className={inputClass}
                value={entry.date ?? ""}
                onChange={(e) => updateCertification(entry.id, { date: e.target.value })}
                placeholder="2023"
              />
            </div>
            <button className={removeButtonClass} onClick={() => removeCertification(entry.id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
