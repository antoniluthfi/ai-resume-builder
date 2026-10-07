"use client";

import { useRef } from "react";
import { UserIcon as User } from "@phosphor-icons/react/dist/ssr/User";
import { useResumeStore } from "@/store/resumeStore";
import { useToastStore } from "@/store/toastStore";
import { inputClass, labelClass, removeButtonClass, smallButtonClass } from "@/lib/formStyles";
import { fileToResumePhoto, MAX_PHOTO_FILE_BYTES } from "@/lib/photo";

export function PersonalInfoForm() {
  const personalInfo = useResumeStore((s) => s.resume.personalInfo);
  const setPersonalInfo = useResumeStore((s) => s.setPersonalInfo);
  const showToast = useToastStore((s) => s.showToast);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please choose an image file (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > MAX_PHOTO_FILE_BYTES) {
      showToast("error", "Photo must be smaller than 10 MB");
      return;
    }
    try {
      setPersonalInfo({ photo: await fileToResumePhoto(file) });
    } catch {
      showToast("error", "Could not read that image");
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-slate-400">
          {personalInfo.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={personalInfo.photo} alt="Profile photo" className="h-full w-full object-cover" />
          ) : (
            <User size={28} />
          )}
        </div>
        <div className="space-y-1">
          <p className={labelClass}>Photo (optional)</p>
          <div className="flex items-center gap-3">
            <button type="button" className={smallButtonClass} onClick={() => photoInputRef.current?.click()}>
              {personalInfo.photo ? "Change photo" : "Upload photo"}
            </button>
            {personalInfo.photo && (
              <button type="button" className={removeButtonClass} onClick={() => setPersonalInfo({ photo: undefined })}>
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">Skip it for US/UK/Canada roles — recruiters there expect no photo.</p>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>
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
