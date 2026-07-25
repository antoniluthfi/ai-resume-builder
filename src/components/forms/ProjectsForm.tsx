"use client";

import { PlusCircleIcon as PlusCircle } from "@phosphor-icons/react/dist/ssr/PlusCircle";
import { useResumeStore } from "@/store/resumeStore";
import { entryCardClass, inputClass, labelClass, removeButtonClass, smallButtonClass } from "@/lib/formStyles";
import { ProjectEntry } from "@/types/resume";

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.resume.projects);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);

  function updateLink(entry: ProjectEntry, index: number, value: string) {
    const links = [...(entry.links ?? [])];
    links[index] = value;
    updateProject(entry.id, { links });
  }

  function addLink(entry: ProjectEntry) {
    updateProject(entry.id, { links: [...(entry.links ?? []), ""] });
  }

  function removeLink(entry: ProjectEntry, index: number) {
    updateProject(entry.id, { links: (entry.links ?? []).filter((_, i) => i !== index) });
  }

  function updateBullet(entry: ProjectEntry, index: number, value: string) {
    const bullets = [...(entry.bullets ?? [])];
    bullets[index] = value;
    updateProject(entry.id, { bullets });
  }

  function addBullet(entry: ProjectEntry) {
    updateProject(entry.id, { bullets: [...(entry.bullets ?? []), ""] });
  }

  function removeBullet(entry: ProjectEntry, index: number) {
    updateProject(entry.id, { bullets: (entry.bullets ?? []).filter((_, i) => i !== index) });
  }

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
            <label className={labelClass}>Tech Stack (optional)</label>
            <input
              className={inputClass}
              value={entry.techStack ?? ""}
              onChange={(e) => updateProject(entry.id, { techStack: e.target.value })}
              placeholder="React Native, TypeScript, Firebase"
            />
          </div>
          <div>
            <label className={labelClass}>Links (optional)</label>
            <div className="space-y-2">
              {(entry.links ?? []).map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={link}
                    onChange={(e) => updateLink(entry, index, e.target.value)}
                    placeholder="github.com/you/project or Play Store URL"
                  />
                  <button className={removeButtonClass} onClick={() => removeLink(entry, index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button className={`${smallButtonClass} mt-2`} onClick={() => addLink(entry)}>
              + Add link
            </button>
          </div>
          <div>
            <label className={labelClass}>Bullet points (optional)</label>
            <div className="space-y-2">
              {(entry.bullets ?? []).map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={bullet}
                    onChange={(e) => updateBullet(entry, index, e.target.value)}
                    placeholder="Built X, improving Y by Z%"
                  />
                  <button className={removeButtonClass} onClick={() => removeBullet(entry, index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button className={`${smallButtonClass} mt-2`} onClick={() => addBullet(entry)}>
              + Add bullet
            </button>
          </div>
          <button className={removeButtonClass} onClick={() => removeProject(entry.id)}>
            Remove
          </button>
        </div>
      ))}
    </>
  );
}
