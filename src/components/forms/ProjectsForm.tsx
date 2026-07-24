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

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.resume.projects);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Projects (optional)</h2>
        <button className={smallButtonClass} onClick={addProject}>
          + Add project
        </button>
      </div>

      {projects.map((entry) => (
        <div key={entry.id} className="rounded-md border border-gray-100 p-3 space-y-3">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={entry.name}
              onChange={(e) => updateProject(entry.id, { name: e.target.value })}
              placeholder="AI Resume Builder"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              value={entry.description}
              onChange={(e) => updateProject(entry.id, { description: e.target.value })}
              placeholder="Short one-line description"
            />
          </div>
          <div>
            <label className={labelClass}>Link (optional)</label>
            <input
              className={inputClass}
              value={entry.link ?? ""}
              onChange={(e) => updateProject(entry.id, { link: e.target.value })}
              placeholder="github.com/you/project"
            />
          </div>
          <button className={removeButtonClass} onClick={() => removeProject(entry.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
