import { create } from "zustand";
import {
  CertificationEntry,
  EducationEntry,
  emptyResumeData,
  ExperienceEntry,
  ParsedResumeData,
  PersonalInfo,
  ProjectEntry,
  ResumeData,
} from "@/types/resume";
import { LlmProvider, RawMissingSkill, RawProjectRelevance } from "@/lib/llm/types";

const STORAGE_KEY = "ai-resume-builder:resume";
const PROVIDER_KEYS_STORAGE_KEY = "ai-resume-builder:provider-keys";
const VERSIONS_STORAGE_KEY = "ai-resume-builder:versions";
const MAX_UNDO_ENTRIES = 10;

function readStoredResume(): ResumeData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...emptyResumeData, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function persist(resume: ResumeData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
}

function readStoredProviderKeys(): Partial<Record<LlmProvider, string>> | null {
  try {
    const raw = window.localStorage.getItem(PROVIDER_KEYS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistProviderKeys(keys: Partial<Record<LlmProvider, string>>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROVIDER_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

function readStoredVersions(): ResumeVersion[] | null {
  try {
    const raw = window.localStorage.getItem(VERSIONS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistVersions(versions: ResumeVersion[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(versions));
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export interface AiSuggestion {
  id: string;
  path: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface ProjectRelevance {
  projectId: string;
  relevant: boolean;
  reason: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  createdAt: string;
  jobDescription: string;
  resume: ResumeData;
  hiddenProjectIds: string[];
}

interface UndoSnapshot {
  resume: ResumeData;
  hiddenProjectIds: string[];
}

export interface BackupData {
  resume: ResumeData;
  versions: ResumeVersion[];
}

interface ResumeState {
  resume: ResumeData;
  jobDescription: string;
  aiSuggestions: AiSuggestion[];
  aiMissingSkills: RawMissingSkill[];
  isAnalyzing: boolean;
  analyzeError: string | null;
  providerKeys: Partial<Record<LlmProvider, string>>;
  selectedProvider: LlmProvider;
  projectRelevance: ProjectRelevance[];
  hiddenProjectIds: string[];
  versions: ResumeVersion[];
  undoStack: UndoSnapshot[];

  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  setSummary: (summary: string) => void;
  setSkills: (skills: string[]) => void;
  setJobDescription: (jobDescription: string) => void;
  loadParsedResume: (parsed: ParsedResumeData) => void;
  hydrateFromStorage: () => void;
  setProviderKey: (provider: LlmProvider, key: string) => void;
  setSelectedProvider: (provider: LlmProvider) => void;

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

  setAiSuggestions: (suggestions: AiSuggestion[]) => void;
  setAiMissingSkills: (skills: RawMissingSkill[]) => void;
  applySuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalyzeError: (error: string | null) => void;
  setProjectRelevance: (raw: RawProjectRelevance[]) => void;
  toggleProjectVisibility: (projectId: string) => void;
  isProjectHidden: (projectId: string) => boolean;

  saveVersion: (name: string) => void;
  loadVersion: (id: string) => void;
  deleteVersion: (id: string) => void;

  pushUndoSnapshot: () => void;
  undo: () => void;

  exportBackup: () => BackupData;
  restoreBackup: (data: BackupData) => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resume: emptyResumeData,
  jobDescription: "",
  aiSuggestions: [],
  aiMissingSkills: [],
  isAnalyzing: false,
  analyzeError: null,
  providerKeys: {},
  selectedProvider: "anthropic",
  projectRelevance: [],
  hiddenProjectIds: [],
  versions: [],
  undoStack: [],

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

  setJobDescription: (jobDescription) => set({ jobDescription }),

  loadParsedResume: (parsed) => {
    get().pushUndoSnapshot();
    set(() => {
      const resume: ResumeData = {
        personalInfo: parsed.personalInfo,
        summary: parsed.summary,
        skills: Array.from(new Set(parsed.skills)),
        experience: parsed.experience.map((entry) => ({ ...entry, id: makeId() })),
        education: parsed.education.map((entry) => ({ ...entry, id: makeId() })),
        projects: parsed.projects.map((entry) => ({ ...entry, id: makeId() })),
        certifications: parsed.certifications.map((entry) => ({ ...entry, id: makeId() })),
      };
      persist(resume);
      return { resume, hiddenProjectIds: [] };
    });
  },

  hydrateFromStorage: () => {
    const stored = readStoredResume();
    const storedKeys = readStoredProviderKeys();
    const storedVersions = readStoredVersions();
    set({
      ...(stored ? { resume: stored } : {}),
      ...(storedKeys ? { providerKeys: storedKeys } : {}),
      ...(storedVersions ? { versions: storedVersions } : {}),
    });
  },

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

  setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  setAiMissingSkills: (skills) => set({ aiMissingSkills: skills }),

  applySuggestion: (id) => {
    const suggestion = get().aiSuggestions.find((s) => s.id === id);
    if (!suggestion) return;
    get().pushUndoSnapshot();

    set((state) => {
      const resume = applyPathValue(state.resume, suggestion.path, suggestion.suggested);
      persist(resume);
      return {
        resume,
        aiSuggestions: state.aiSuggestions.filter((s) => s.id !== id),
      };
    });
  },

  dismissSuggestion: (id) =>
    set((state) => ({ aiSuggestions: state.aiSuggestions.filter((s) => s.id !== id) })),

  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalyzeError: (analyzeError) => set({ analyzeError }),

  setProviderKey: (provider, key) =>
    set((state) => {
      const providerKeys = { ...state.providerKeys, [provider]: key };
      persistProviderKeys(providerKeys);
      return { providerKeys };
    }),

  setSelectedProvider: (provider) => set({ selectedProvider: provider }),

  setProjectRelevance: (raw) => {
    const projects = get().resume.projects;
    const projectRelevance: ProjectRelevance[] = raw
      .map((r) => {
        const project = projects[r.index];
        if (!project) return null;
        return { projectId: project.id, relevant: r.relevant, reason: r.reason };
      })
      .filter((r): r is ProjectRelevance => r !== null);

    set({
      projectRelevance,
      hiddenProjectIds: projectRelevance.filter((r) => !r.relevant).map((r) => r.projectId),
    });
  },

  toggleProjectVisibility: (projectId) =>
    set((state) => ({
      hiddenProjectIds: state.hiddenProjectIds.includes(projectId)
        ? state.hiddenProjectIds.filter((id) => id !== projectId)
        : [...state.hiddenProjectIds, projectId],
    })),

  isProjectHidden: (projectId) => get().hiddenProjectIds.includes(projectId),

  saveVersion: (name) =>
    set((state) => {
      const version: ResumeVersion = {
        id: makeId(),
        name,
        createdAt: new Date().toISOString(),
        jobDescription: state.jobDescription,
        resume: state.resume,
        hiddenProjectIds: state.hiddenProjectIds,
      };
      const versions = [version, ...state.versions];
      persistVersions(versions);
      return { versions };
    }),

  loadVersion: (id) => {
    const version = get().versions.find((v) => v.id === id);
    if (!version) return;
    get().pushUndoSnapshot();
    persist(version.resume);
    set({
      resume: version.resume,
      jobDescription: version.jobDescription,
      hiddenProjectIds: version.hiddenProjectIds,
    });
  },

  deleteVersion: (id) =>
    set((state) => {
      const versions = state.versions.filter((v) => v.id !== id);
      persistVersions(versions);
      return { versions };
    }),

  pushUndoSnapshot: () =>
    set((state) => ({
      undoStack: [
        ...state.undoStack.slice(-(MAX_UNDO_ENTRIES - 1)),
        { resume: state.resume, hiddenProjectIds: state.hiddenProjectIds },
      ],
    })),

  undo: () =>
    set((state) => {
      const last = state.undoStack[state.undoStack.length - 1];
      if (!last) return state;
      persist(last.resume);
      return {
        resume: last.resume,
        hiddenProjectIds: last.hiddenProjectIds,
        undoStack: state.undoStack.slice(0, -1),
      };
    }),

  exportBackup: () => ({
    resume: get().resume,
    versions: get().versions,
  }),

  restoreBackup: (data) => {
    get().pushUndoSnapshot();
    persist(data.resume);
    persistVersions(data.versions);
    set({ resume: data.resume, versions: data.versions, hiddenProjectIds: [] });
  },
}));

/**
 * Applies a suggested value to a dot/bracket path like "experience[0].bullets[2]"
 * or "summary". Only supports the shapes the AI route is prompted to return.
 */
function applyPathValue(resume: ResumeData, path: string, value: string): ResumeData {
  const tokens = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  const clone = JSON.parse(JSON.stringify(resume)) as ResumeData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let target: any = clone;
  for (let i = 0; i < tokens.length - 1; i++) {
    target = target[tokens[i]];
    if (target === undefined) return resume;
  }
  const lastKey = tokens[tokens.length - 1];
  if (target[lastKey] === undefined) return resume;
  target[lastKey] = value;
  return clone;
}

export function resumeToMatchText(resume: ResumeData): string {
  return [
    resume.personalInfo.title,
    resume.summary,
    resume.skills.join(", "),
    ...resume.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.name, p.description, ...(p.bullets ?? [])]),
    ...resume.education.map((e) => `${e.degree} ${e.field ?? ""}`),
  ]
    .filter(Boolean)
    .join(" \n ");
}
