"use client";

import { useResumeStore } from "@/store/resumeStore";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  removeButtonClass,
  sectionClass,
  sectionTitleClass,
  smallButtonClass,
} from "@/lib/formStyles";

export function EducationForm() {
  const education = useResumeStore((s) => s.resume.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Education</h2>
        <button className={smallButtonClass} onClick={addEducation}>
          + Add education
        </button>
      </div>

      {education.map((entry) => (
        <div key={entry.id} className="rounded-md border border-gray-100 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
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
        <button className={primaryButtonClass} onClick={addEducation}>
          Add your education
        </button>
      )}
    </div>
  );
}
