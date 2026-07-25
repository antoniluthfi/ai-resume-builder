"use client";

import { PlusCircleIcon as PlusCircle } from "@phosphor-icons/react/dist/ssr/PlusCircle";
import { useResumeStore } from "@/store/resumeStore";
import { entryCardClass, inputClass, labelClass, removeButtonClass, smallButtonClass } from "@/lib/formStyles";

export function CertificationsForm() {
  const certifications = useResumeStore((s) => s.resume.certifications);
  const addCertification = useResumeStore((s) => s.addCertification);
  const updateCertification = useResumeStore((s) => s.updateCertification);
  const removeCertification = useResumeStore((s) => s.removeCertification);

  return (
    <>
      <div className="flex justify-end">
        <button className={`inline-flex items-center gap-1 ${smallButtonClass}`} onClick={addCertification}>
          <PlusCircle size={14} weight="bold" />
          Add certification
        </button>
      </div>

      {certifications.map((entry) => (
        <div key={entry.id} className={`grid grid-cols-1 gap-2 sm:grid-cols-3 ${entryCardClass}`}>
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
    </>
  );
}
