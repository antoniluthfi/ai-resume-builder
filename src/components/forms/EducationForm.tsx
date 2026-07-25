"use client";

import { PlusCircleIcon as PlusCircle } from "@phosphor-icons/react/dist/ssr/PlusCircle";
import { useResumeStore } from "@/store/resumeStore";
import {
  entryCardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  removeButtonClass,
  smallButtonClass,
} from "@/lib/formStyles";

export function EducationForm() {
  const education = useResumeStore((s) => s.resume.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  return (
    <>
      {education.length > 0 && (
        <div className="flex justify-end">
          <button className={`inline-flex items-center gap-1 ${smallButtonClass}`} onClick={addEducation}>
            <PlusCircle size={14} weight="bold" />
            Add education
          </button>
        </div>
      )}

      {education.map((entry) => (
        <div key={entry.id} className={entryCardClass}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>School</label>
              <input
                className={inputClass}
                value={entry.school}
                onChange={(e) => updateEducation(entry.id, { school: e.target.value })}
                placeholder="University of Indonesia"
              />
            </div>
            <div>
              <label className={labelClass}>Degree</label>
              <input
                className={inputClass}
                value={entry.degree}
                onChange={(e) => updateEducation(entry.id, { degree: e.target.value })}
                placeholder="B.Sc."
              />
            </div>
            <div>
              <label className={labelClass}>Field (optional)</label>
              <input
                className={inputClass}
                value={entry.field ?? ""}
                onChange={(e) => updateEducation(entry.id, { field: e.target.value })}
                placeholder="Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Start</label>
                <input
                  className={inputClass}
                  value={entry.startDate}
                  onChange={(e) => updateEducation(entry.id, { startDate: e.target.value })}
                  placeholder="2018"
                />
              </div>
              <div>
                <label className={labelClass}>End</label>
                <input
                  className={inputClass}
                  value={entry.endDate ?? ""}
                  onChange={(e) => updateEducation(entry.id, { endDate: e.target.value })}
                  placeholder="2022"
                />
              </div>
            </div>
          </div>
          <button className={removeButtonClass} onClick={() => removeEducation(entry.id)}>
            Remove
          </button>
        </div>
      ))}

      {education.length === 0 && (
        <button className={`inline-flex items-center gap-1.5 ${primaryButtonClass}`} onClick={addEducation}>
          <PlusCircle size={16} weight="bold" />
          Add your education
        </button>
      )}
    </>
  );
}
