"use client";

import { useResumeStore } from "@/store/resumeStore";

export function ResumePreview() {
  const resume = useResumeStore((s) => s.resume);
  const { personalInfo, summary, experience, education, skills, projects, certifications } = resume;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-sm text-gray-900 space-y-4">
      <div>
        <h1 className="text-xl font-bold">{personalInfo.name || "Your Name"}</h1>
        <p className="text-xs text-gray-600">
          {[personalInfo.email, personalInfo.phone, personalInfo.location]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="text-xs text-gray-600">
          {[personalInfo.linkedin, personalInfo.website].filter(Boolean).join(" · ")}
        </p>
      </div>

      {summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
            Summary
          </h2>
          <p>{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((entry) => (
              <div key={entry.id}>
                <div className="flex justify-between font-semibold">
                  <span>
                    {entry.title || "Job title"} — {entry.company || "Company"}
                  </span>
                  <span className="text-xs text-gray-600">
                    {entry.startDate} – {entry.endDate || "Present"}
                  </span>
                </div>
                {entry.location && <p className="text-xs text-gray-600">{entry.location}</p>}
                <ul className="list-disc list-inside">
                  {entry.bullets.filter(Boolean).map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((entry) => (
              <div key={entry.id} className="flex justify-between">
                <span>
                  {entry.degree} {entry.field && `in ${entry.field}`} — {entry.school}
                </span>
                <span className="text-xs text-gray-600">
                  {entry.startDate} – {entry.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
            Skills
          </h2>
          <p>{skills.join(", ")}</p>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((entry) => (
              <div key={entry.id}>
                <p className="font-semibold">
                  {entry.name} {entry.link && `(${entry.link})`}
                </p>
                <p>{entry.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">
            Certifications
          </h2>
          <div className="space-y-1">
            {certifications.map((entry) => (
              <div key={entry.id} className="flex justify-between">
                <span>
                  {entry.name} {entry.issuer && `— ${entry.issuer}`}
                </span>
                <span className="text-xs text-gray-600">{entry.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
