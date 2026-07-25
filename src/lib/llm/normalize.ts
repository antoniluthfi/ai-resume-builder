import { ParsedResumeData } from "@/types/resume";
import { AnalyzeJdResult, RawBulletRewrite } from "./types";

export function normalizeAnalyzeResult(parsed: Partial<AnalyzeJdResult>): AnalyzeJdResult {
  const missingSkills = Array.isArray(parsed.missingSkills)
    ? parsed.missingSkills.map((m) => ({
        skill: m?.skill ?? "",
        reason: m?.reason ?? "",
        impliedBy: Array.isArray(m?.impliedBy) ? m.impliedBy : [],
      }))
    : [];

  const rawKeywordMatch = parsed.keywordMatch;
  const matched = Array.isArray(rawKeywordMatch?.matched) ? rawKeywordMatch.matched : [];
  const missing = Array.isArray(rawKeywordMatch?.missing) ? rawKeywordMatch.missing : [];
  const matchPercentage =
    typeof rawKeywordMatch?.matchPercentage === "number"
      ? rawKeywordMatch.matchPercentage
      : matched.length + missing.length === 0
        ? 0
        : Math.round((matched.length / (matched.length + missing.length)) * 100);

  return {
    missingSkills,
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    projectRelevance: Array.isArray(parsed.projectRelevance) ? parsed.projectRelevance : [],
    keywordMatch: { matchPercentage, matched, missing },
  };
}

export function normalizeBulletRewrites(parsed: { rewrites?: unknown }): RawBulletRewrite[] {
  if (!Array.isArray(parsed.rewrites)) return [];
  return parsed.rewrites.map((r: Partial<RawBulletRewrite>) => ({
    path: r?.path ?? "",
    original: r?.original ?? "",
    suggested: r?.suggested ?? "",
    reason: r?.reason ?? "",
    needsUserInput: r?.needsUserInput === true,
  }));
}

export function normalizeParsedResume(parsed: Partial<ParsedResumeData>): ParsedResumeData {
  return {
    personalInfo: {
      name: parsed.personalInfo?.name ?? "",
      title: parsed.personalInfo?.title ?? "",
      email: parsed.personalInfo?.email ?? "",
      phone: parsed.personalInfo?.phone ?? "",
      location: parsed.personalInfo?.location ?? "",
      linkedin: parsed.personalInfo?.linkedin ?? "",
      website: parsed.personalInfo?.website ?? "",
    },
    summary: parsed.summary ?? "",
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
  };
}
