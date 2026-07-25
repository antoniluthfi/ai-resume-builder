"use client";

import { useResumeStore } from "@/store/resumeStore";
import { getResumeSectionOrder, ResumeSectionKey } from "@/lib/resumeSectionOrder";

export function ResumePreview() {
  const resume = useResumeStore((s) => s.resume);
  const hiddenProjectIds = useResumeStore((s) => s.hiddenProjectIds);
  const { personalInfo, summary, experience, education, skills, certifications } = resume;
  const projects = resume.projects.filter((p) => !hiddenProjectIds.includes(p.id));

  const sectionNodes: Partial<Record<ResumeSectionKey, React.ReactNode>> = {
    summary: summary && (
      <section key="summary">
        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          Summary
        </h2>
        <p>{summary}</p>
      </section>
    ),

    experience: experience.length > 0 && (
      <section key="experience">
        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          Experience
        </h2>
        <div className="space-y-3">
          {experience.map((entry) => (
            <div key={entry.id}>
              <div className="flex justify-between font-semibold">
                <span>
                  {entry.title || "Job title"} — {entry.company || "Company"}
                </span>
                <span className="text-xs text-slate-600">
                  {entry.startDate} – {entry.endDate || "Present"}
                </span>
              </div>
              {entry.location && <p className="text-xs text-slate-600">{entry.location}</p>}
              <ul className="list-disc list-inside">
                {entry.bullets.filter(Boolean).map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    ),

    education: education.length > 0 && (
      <section key="education">
        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          Education
        </h2>
        <div className="space-y-2">
          {education.map((entry) => (
            <div key={entry.id} className="flex justify-between">
              <span>
                {entry.degree} {entry.field && `in ${entry.field}`} — {entry.school}
              </span>
              <span className="text-xs text-slate-600">
                {entry.startDate} – {entry.endDate}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),

    skills: skills.length > 0 && (
      <section key="skills">
        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          Skills
        </h2>
        <p>{skills.join(", ")}</p>
      </section>
    ),

    projects: projects.length > 0 && (
      <section key="projects">
        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          Projects
        </h2>
        <div className="space-y-2">
          {projects.map((entry) => (
            <div key={entry.id}>
              <p className="font-semibold">{entry.name}</p>
              {(entry.links ?? []).map((link, i) => (
                <p key={i} className="text-xs text-slate-600">
                  {link}
                </p>
              ))}
              <p>{entry.description}</p>
              {entry.techStack && <p className="text-xs text-slate-600">{entry.techStack}</p>}
              {(entry.bullets ?? []).filter(Boolean).length > 0 && (
                <ul className="list-disc list-inside">
                  {(entry.bullets ?? []).filter(Boolean).map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    ),

    certifications: certifications.length > 0 && (
      <section key="certifications">
        <h2 className="text-xs font-bold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          Certifications
        </h2>
        <div className="space-y-1">
          {certifications.map((entry) => (
            <div key={entry.id} className="flex justify-between">
              <span>
                {entry.name} {entry.issuer && `— ${entry.issuer}`}
              </span>
              <span className="text-xs text-slate-600">{entry.date}</span>
            </div>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 space-y-4 sm:p-8 [box-shadow:var(--shadow-card)]">
      <div>
        <h1 className="text-xl font-bold">{personalInfo.name || "Your Name"}</h1>
        {personalInfo.title && (
          <p className="text-sm font-medium text-slate-700">{personalInfo.title}</p>
        )}
        <p className="text-xs text-slate-600">
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="text-xs text-slate-600">
          {[personalInfo.linkedin, personalInfo.website].filter(Boolean).join(" · ")}
        </p>
      </div>

      {getResumeSectionOrder(resume).map((key) => sectionNodes[key])}
    </div>
  );
}
