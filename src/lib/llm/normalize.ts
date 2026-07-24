import { ParsedResumeData } from "@/types/resume";
import { AnalyzeJdResult } from "./types";

export function normalizeAnalyzeResult(parsed: Partial<AnalyzeJdResult>): AnalyzeJdResult {
  const missingSkills = Array.isArray(parsed.missingSkills)
    ? parsed.missingSkills.map((m) => ({
        skill: m?.skill ?? "",
        reason: m?.reason ?? "",
        impliedBy: Array.isArray(m?.impliedBy) ? m.impliedBy : [],
      }))
    : [];

  return {
    missingSkills,
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    projectRelevance: Array.isArray(parsed.projectRelevance) ? parsed.projectRelevance : [],
  };
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
