"use client";

import { PlusCircleIcon as PlusCircle } from "@phosphor-icons/react/dist/ssr/PlusCircle";
import { useResumeStore } from "@/store/resumeStore";
import { entryCardClass, inputClass, labelClass, removeButtonClass, smallButtonClass } from "@/lib/formStyles";

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.resume.projects);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  return (
    <>
      <div className="flex justify-end">
        <button className={`inline-flex items-center gap-1 ${smallButtonClass}`} onClick={addProject}>
          <PlusCircle size={14} weight="bold" />
          Add project
        </button>
      </div>

      {projects.map((entry) => (
        <div key={entry.id} className={entryCardClass}>
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
    </>
  );
}
