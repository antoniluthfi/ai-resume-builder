import { ResumeData } from "@/types/resume";
import { countResumeBullets, QualityIssue } from "./resumeQualityCheck";

export interface ResumeScore {
  overall: number;
  completeness: number;
  writingQuality: number;
  keywordMatch: number | null;
  tips: string[];
}

function computeCompleteness(resume: ResumeData): number {
  const checks = [
    Boolean(resume.personalInfo.name.trim()),
    Boolean(resume.personalInfo.email.trim()),
    Boolean(resume.personalInfo.phone.trim()),
    resume.summary.trim().length >= 40,
    resume.skills.length >= 3,
    resume.experience.length > 0 && resume.experience.some((e) => e.bullets.some(Boolean)),
    resume.experience.every((e) => Boolean(e.startDate)),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function computeWritingQuality(bulletCount: number, issueCount: number): number {
  if (bulletCount === 0) return 100;
  return Math.max(0, Math.round((100 * (bulletCount - issueCount)) / bulletCount));
}

export function computeResumeScore(
  resume: ResumeData,
  issues: QualityIssue[],
  matchPercentage: number | null
): ResumeScore {
  const bulletCount = countResumeBullets(resume);
  const completeness = computeCompleteness(resume);
  const writingQuality = computeWritingQuality(bulletCount, issues.length);

  const overall =
    matchPercentage === null
      ? Math.round(completeness * 0.5 + writingQuality * 0.5)
      : Math.round(completeness * 0.3 + writingQuality * 0.3 + matchPercentage * 0.4);

  const tips: string[] = [];
  if (completeness < 100) {
    if (!resume.summary.trim() || resume.summary.trim().length < 40) {
      tips.push("Add a professional summary (at least a couple sentences).");
    } else if (resume.skills.length < 3) {
      tips.push("List at least a few core skills.");
    } else {
      tips.push("Fill in the remaining contact/experience fields.");
    }
  }
  if (bulletCount > 0 && issues.length > 0) {
    tips.push(`${issues.length} bullet${issues.length === 1 ? "" : "s"} could use stronger verbs or metrics.`);
  }
  if (matchPercentage !== null && matchPercentage < 100) {
    tips.push("Missing keywords from the job description — see Keyword Match below.");
  }

  return { overall, completeness, writingQuality, keywordMatch: matchPercentage, tips: tips.slice(0, 3) };
}
