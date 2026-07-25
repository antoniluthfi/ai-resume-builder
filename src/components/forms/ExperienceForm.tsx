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
import { ExperienceEntry } from "@/types/resume";

export function ExperienceForm() {
  const experience = useResumeStore((s) => s.resume.experience);
  const addExperience = useResumeStore((s) => s.addExperience);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);

  function updateBullet(entry: ExperienceEntry, index: number, value: string) {
    const bullets = [...entry.bullets];
    bullets[index] = value;
    updateExperience(entry.id, { bullets });
  }

  function addBullet(entry: ExperienceEntry) {
    updateExperience(entry.id, { bullets: [...entry.bullets, ""] });
  }

  function removeBullet(entry: ExperienceEntry, index: number) {
    updateExperience(entry.id, { bullets: entry.bullets.filter((_, i) => i !== index) });
  }

  return (
    <>
      {experience.length > 0 && (
        <div className="flex justify-end">
          <button className={`inline-flex items-center gap-1 ${smallButtonClass}`} onClick={addExperience}>
            <PlusCircle size={14} weight="bold" />
            Add experience
          </button>
        </div>
      )}

      {experience.map((entry) => (
        <div key={entry.id} className={entryCardClass}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Job title</label>
              <input
                className={inputClass}
                value={entry.title}
                onChange={(e) => updateExperience(entry.id, { title: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input
                className={inputClass}
                value={entry.company}
                onChange={(e) => updateExperience(entry.id, { company: e.target.value })}
                placeholder="Acme Inc"
              />
            </div>
            <div>
              <label className={labelClass}>Location (optional)</label>
              <input
                className={inputClass}
                value={entry.location ?? ""}
                onChange={(e) => updateExperience(entry.id, { location: e.target.value })}
                placeholder="Remote"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Start</label>
                <input
                  className={inputClass}
                  value={entry.startDate}
                  onChange={(e) => updateExperience(entry.id, { startDate: e.target.value })}
                  placeholder="Jan 2022"
                />
              </div>
              <div>
                <label className={labelClass}>End</label>
                <input
                  className={inputClass}
                  value={entry.endDate ?? ""}
                  onChange={(e) => updateExperience(entry.id, { endDate: e.target.value })}
                  placeholder="Present"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Bullet points</label>
            <div className="space-y-2">
              {entry.bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={bullet}
                    onChange={(e) => updateBullet(entry, index, e.target.value)}
                    placeholder="Led migration of X, improving Y by Z%"
                  />
                  <button
                    className={removeButtonClass}
                    onClick={() => removeBullet(entry, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button className={`${smallButtonClass} mt-2`} onClick={() => addBullet(entry)}>
              + Add bullet
            </button>
          </div>

          <button className={removeButtonClass} onClick={() => removeExperience(entry.id)}>
            Remove this experience
          </button>
        </div>
      ))}

      {experience.length === 0 && (
        <button className={`inline-flex items-center gap-1.5 ${primaryButtonClass}`} onClick={addExperience}>
          <PlusCircle size={16} weight="bold" />
          Add your first experience
        </button>
      )}
    </>
  );
}
