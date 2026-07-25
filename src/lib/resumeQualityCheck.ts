import { ResumeData } from "@/types/resume";

export interface QualityIssue {
  path: string;
  location: string;
  text: string;
  problems: string[];
}

const WEAK_START_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /^responsible for\b/i, label: "responsible for" },
  { pattern: /^in charge of\b/i, label: "in charge of" },
  { pattern: /^worked on\b/i, label: "worked on" },
  { pattern: /^helped (?:with|to)\b/i, label: "helped with/to" },
  { pattern: /^duties included\b/i, label: "duties included" },
  { pattern: /^tasked with\b/i, label: "tasked with" },
  { pattern: /^involved in\b/i, label: "involved in" },
];

const MIN_WORDS = 5;
const MAX_WORDS = 30;

function checkBullet(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const problems: string[] = [];

  const weakMatch = WEAK_START_PATTERNS.find(({ pattern }) => pattern.test(trimmed));
  if (weakMatch) {
    problems.push(
      `Starts with "${weakMatch.label}", which can read as passive — a strong action verb like "Led", "Built", or "Reduced" may land stronger.`
    );
  }

  if (/^(i|my)\b/i.test(trimmed)) {
    problems.push(`Resume bullets are usually written without "I"/"My" since first person is implied — you may want to drop it.`);
  }

  if (!/\d/.test(trimmed) && !trimmed.includes("%")) {
    problems.push(`Consider adding a number or metric (e.g. "by 30%", "for 50k users") to show impact.`);
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORDS) {
    problems.push(`This bullet feels incomplete — add more context about what you did and its impact.`);
  } else if (wordCount > MAX_WORDS) {
    problems.push(`This bullet is quite long — consider splitting it or trimming to the most impactful part.`);
  }

  return problems;
}

export function countResumeBullets(resume: ResumeData): number {
  return (
    resume.experience.reduce((sum, e) => sum + e.bullets.filter(Boolean).length, 0) +
    resume.projects.reduce((sum, p) => sum + (p.bullets?.filter(Boolean).length ?? 0), 0)
  );
}

/** Local, instant, no-API-call heuristic check for common weak-resume-bullet patterns. */
export function checkResumeQuality(resume: ResumeData): QualityIssue[] {
  const issues: QualityIssue[] = [];

  resume.experience.forEach((entry, entryIndex) => {
    entry.bullets.forEach((bullet, bulletIndex) => {
      const problems = checkBullet(bullet);
      if (problems.length === 0) return;
      issues.push({
        path: `experience[${entryIndex}].bullets[${bulletIndex}]`,
        location: `${entry.title || "Experience"}${entry.company ? ` at ${entry.company}` : ""} — bullet ${bulletIndex + 1}`,
        text: bullet,
        problems,
      });
    });
  });

  resume.projects.forEach((entry, entryIndex) => {
    (entry.bullets ?? []).forEach((bullet, bulletIndex) => {
      const problems = checkBullet(bullet);
      if (problems.length === 0) return;
      issues.push({
        path: `projects[${entryIndex}].bullets[${bulletIndex}]`,
        location: `Project: ${entry.name || "Untitled"} — bullet ${bulletIndex + 1}`,
        text: bullet,
        problems,
      });
    });
  });

  return issues;
}
