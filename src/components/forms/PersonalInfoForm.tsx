"use client";

import { useResumeStore } from "@/store/resumeStore";
import { inputClass, labelClass } from "@/lib/formStyles";

export function PersonalInfoForm() {
  const personalInfo = useResumeStore((s) => s.resume.personalInfo);
  const setPersonalInfo = useResumeStore((s) => s.setPersonalInfo);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Full name</label>
          <input
            className={inputClass}
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({ name: e.target.value })}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className={labelClass}>Professional title (optional)</label>
          <input
            className={inputClass}
            value={personalInfo.title ?? ""}
            onChange={(e) => setPersonalInfo({ title: e.target.value })}
            placeholder="Senior Frontend Engineer"
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ email: e.target.value })}
            placeholder="jane@email.com"
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({ phone: e.target.value })}
            placeholder="+62 812 3456 7890"
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input
            className={inputClass}
            value={personalInfo.location}
            onChange={(e) => setPersonalInfo({ location: e.target.value })}
            placeholder="Jakarta, Indonesia"
          />
        </div>
        <div>
          <label className={labelClass}>LinkedIn (optional)</label>
          <input
            className={inputClass}
            value={personalInfo.linkedin ?? ""}
            onChange={(e) => setPersonalInfo({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/janedoe"
          />
        </div>
        <div>
          <label className={labelClass}>Website (optional)</label>
          <input
            className={inputClass}
            value={personalInfo.website ?? ""}
            onChange={(e) => setPersonalInfo({ website: e.target.value })}
            placeholder="janedoe.dev"
          />
        </div>
      </div>
    </>
  );
}
