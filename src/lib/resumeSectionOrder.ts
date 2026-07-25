import { ResumeData } from "@/types/resume";

export type ResumeSectionKey = "summary" | "skills" | "experience" | "projects" | "education" | "certifications";

const ORDER_WITH_EXPERIENCE: ResumeSectionKey[] = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
];

const ORDER_FRESH_GRADUATE: ResumeSectionKey[] = [
  "summary",
  "education",
  "skills",
  "projects",
  "experience",
  "certifications",
];

/**
 * Experienced candidates should lead with Skills (keyword-dense, scanned
 * first by ATS/recruiters) and push Education down; a fresh graduate with no
 * work history should lead with Education - their strongest credential -
 * ahead of Skills/Projects.
 */
export function getResumeSectionOrder(resume: ResumeData): ResumeSectionKey[] {
  const isFreshGraduate = resume.experience.length === 0;
  return isFreshGraduate ? ORDER_FRESH_GRADUATE : ORDER_WITH_EXPERIENCE;
}
