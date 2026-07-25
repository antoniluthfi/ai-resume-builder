"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { inputClass, tagClass } from "@/lib/formStyles";

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
    <>
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
            className={`inline-flex items-center gap-1.5 bg-accent-soft text-accent-hover ${tagClass}`}
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="text-accent/60 hover:text-accent-hover"
              aria-label={`Remove ${skill}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </>
  );
}
