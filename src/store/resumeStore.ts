import { create } from "zustand";
import {
  CertificationEntry,
  EducationEntry,
  emptyResumeData,
  ExperienceEntry,
  PersonalInfo,
  ProjectEntry,
  ResumeData,
} from "@/types/resume";

const STORAGE_KEY = "ai-resume-builder:resume";

function loadInitialResume(): ResumeData {
  if (typeof window === "undefined") return emptyResumeData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyResumeData;
    return { ...emptyResumeData, ...JSON.parse(raw) };
  } catch {
    return emptyResumeData;
  }
}

function persist(resume: ResumeData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

interface ResumeState {
  resume: ResumeData;

  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  setSummary: (summary: string) => void;
  setSkills: (skills: string[]) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<CertificationEntry>) => void;
  removeCertification: (id: string) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: loadInitialResume(),

  setPersonalInfo: (info) =>
    set((state) => {
      const resume = {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, ...info },
      };
      persist(resume);
      return { resume };
    }),

  setSummary: (summary) =>
    set((state) => {
      const resume = { ...state.resume, summary };
      persist(resume);
      return { resume };
    }),

  setSkills: (skills) =>
    set((state) => {
      const resume = { ...state.resume, skills };
      persist(resume);
      return { resume };
    }),

  addExperience: () =>
    set((state) => {
      const entry: ExperienceEntry = {
        id: makeId(),
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [""],
      };
      const resume = { ...state.resume, experience: [...state.resume.experience, entry] };
      persist(resume);
      return { resume };
    }),

  updateExperience: (id, patch) =>
    set((state) => {
      const resume = {
        ...state.resume,
        experience: state.resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      };
      persist(resume);
      return { resume };
    }),

  removeExperience: (id) =>
    set((state) => {
      const resume = {
        ...state.resume,
        experience: state.resume.experience.filter((e) => e.id !== id),
      };
      persist(resume);
      return { resume };
    }),

  addEducation: () =>
    set((state) => {
      const entry: EducationEntry = {
        id: makeId(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
      };
      const resume = { ...state.resume, education: [...state.resume.education, entry] };
      persist(resume);
      return { resume };
    }),

  updateEducation: (id, patch) =>
    set((state) => {
      const resume = {
        ...state.resume,
        education: state.resume.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      };
      persist(resume);
      return { resume };
    }),

  removeEducation: (id) =>
    set((state) => {
      const resume = {
        ...state.resume,
        education: state.resume.education.filter((e) => e.id !== id),
      };
      persist(resume);
      return { resume };
    }),

  addProject: () =>
    set((state) => {
      const entry: ProjectEntry = {
        id: makeId(),
        name: "",
        description: "",
        bullets: [],
        link: "",
      };
      const resume = { ...state.resume, projects: [...state.resume.projects, entry] };
      persist(resume);
      return { resume };
    }),

  updateProject: (id, patch) =>
    set((state) => {
      const resume = {
        ...state.resume,
        projects: state.resume.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
      persist(resume);
      return { resume };
    }),

  removeProject: (id) =>
    set((state) => {
      const resume = { ...state.resume, projects: state.resume.projects.filter((p) => p.id !== id) };
      persist(resume);
      return { resume };
    }),

  addCertification: () =>
    set((state) => {
      const entry: CertificationEntry = { id: makeId(), name: "", issuer: "", date: "" };
      const resume = { ...state.resume, certifications: [...state.resume.certifications, entry] };
      persist(resume);
      return { resume };
    }),

  updateCertification: (id, patch) =>
    set((state) => {
      const resume = {
        ...state.resume,
        certifications: state.resume.certifications.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      };
      persist(resume);
      return { resume };
    }),

  removeCertification: (id) =>
    set((state) => {
      const resume = {
        ...state.resume,
        certifications: state.resume.certifications.filter((c) => c.id !== id),
      };
      persist(resume);
      return { resume };
    }),
}));
