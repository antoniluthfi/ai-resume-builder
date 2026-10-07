export interface PersonalInfo {
  name: string;
  title?: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  /** JPEG data URL; optional profile photo shown in the resume header. */
  photo?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  techStack?: string;
  bullets?: string[];
  links?: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
}

export interface ParsedResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Omit<ExperienceEntry, "id">[];
  education: Omit<EducationEntry, "id">[];
  skills: string[];
  projects: Omit<ProjectEntry, "id">[];
  certifications: Omit<CertificationEntry, "id">[];
}

export const emptyResumeData: ResumeData = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};
