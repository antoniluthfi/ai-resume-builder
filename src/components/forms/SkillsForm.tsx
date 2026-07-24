"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { inputClass, sectionClass, sectionTitleClass } from "@/lib/formStyles";

export function SkillsForm() {
  const skills = useResumeStore((s) => s.resume.skills);
  const setSkills = useResumeStore((s) => s.setSkills);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    if (!value) return;
    if (!skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setDraft("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  return (
    <div className={sectionClass}>
      <h2 className={sectionTitleClass}>Skills</h2>
      <input
        className={inputClass}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          }
        }}
        onBlur={commitDraft}
        placeholder="Type a skill and press Enter (e.g. React, SQL, Project Management)"
      />
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="text-blue-400 hover:text-blue-700"
              aria-label={`Remove ${skill}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
