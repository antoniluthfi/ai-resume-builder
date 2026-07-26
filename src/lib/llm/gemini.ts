import "server-only";
import { GoogleGenAI } from "@google/genai";
import { ParsedResumeData, ResumeData } from "@/types/resume";
import { AnalyzeJdResult, LlmClient, RawBulletIssue, RawBulletRewrite, RawProjectLinkContext } from "./types";
import {
  ANALYZE_JD_SYSTEM_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT,
  GENERATE_PROJECT_DESCRIPTION_SYSTEM_PROMPT,
  PARSE_RESUME_SYSTEM_PROMPT,
  REWRITE_BULLET_SYSTEM_PROMPT,
  extractJson,
} from "./prompts";
import { normalizeAnalyzeResult, normalizeBulletRewrites, normalizeParsedResume } from "./normalize";

const MODEL = "gemini-flash-latest";

async function analyzeJobMatch(
  apiKey: string,
  resume: ResumeData,
  jobDescription: string
): Promise<AnalyzeJdResult> {
  const gemini = new GoogleGenAI({ apiKey });

  const response = await gemini.models.generateContent({
    model: MODEL,
    config: { systemInstruction: ANALYZE_JD_SYSTEM_PROMPT, responseMimeType: "application/json" },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME JSON:\n${JSON.stringify(resume, null, 2)}`,
          },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) throw new Error("No text response from Gemini");
  return normalizeAnalyzeResult(JSON.parse(extractJson(text)));
}

async function parseResumeFromPdf(apiKey: string, base64Pdf: string): Promise<ParsedResumeData> {
  const gemini = new GoogleGenAI({ apiKey });

  const response = await gemini.models.generateContent({
    model: MODEL,
    config: { systemInstruction: PARSE_RESUME_SYSTEM_PROMPT, responseMimeType: "application/json" },
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
          { text: "Extract this resume into the JSON shape described in the system instructions." },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) throw new Error("No text response from Gemini");
  return normalizeParsedResume(JSON.parse(extractJson(text)));
}

async function generateCoverLetter(
  apiKey: string,
  resume: ResumeData,
  jobDescription: string
): Promise<string> {
  const gemini = new GoogleGenAI({ apiKey });

  const response = await gemini.models.generateContent({
    model: MODEL,
    config: { systemInstruction: COVER_LETTER_SYSTEM_PROMPT },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME JSON:\n${JSON.stringify(resume, null, 2)}`,
          },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) throw new Error("No text response from Gemini");
  return text.trim();
}

async function rewriteBullets(
  apiKey: string,
  resume: ResumeData,
  issues: RawBulletIssue[],
  projectLinkContext?: Record<number, RawProjectLinkContext>
): Promise<RawBulletRewrite[]> {
  const gemini = new GoogleGenAI({ apiKey });

  const linkContextText =
    projectLinkContext && Object.keys(projectLinkContext).length > 0
      ? `\n\nFETCHED PROJECT LINK CONTEXT (by project index):\n${JSON.stringify(projectLinkContext, null, 2)}`
      : "";

  const response = await gemini.models.generateContent({
    model: MODEL,
    config: { systemInstruction: REWRITE_BULLET_SYSTEM_PROMPT, responseMimeType: "application/json" },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `RESUME JSON:\n${JSON.stringify(resume, null, 2)}\n\nFLAGGED BULLETS:\n${JSON.stringify(issues, null, 2)}${linkContextText}`,
          },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) throw new Error("No text response from Gemini");
  return normalizeBulletRewrites(JSON.parse(extractJson(text)));
}

async function generateProjectDescription(apiKey: string, pageText: string): Promise<string> {
  const gemini = new GoogleGenAI({ apiKey });

  const response = await gemini.models.generateContent({
    model: MODEL,
    config: { systemInstruction: GENERATE_PROJECT_DESCRIPTION_SYSTEM_PROMPT },
    contents: [{ role: "user", parts: [{ text: pageText }] }],
  });

  const text = response.text;
  if (!text) throw new Error("No text response from Gemini");
  return text.trim();
}

export const geminiClient: LlmClient = {
  analyzeJobMatch,
  parseResumeFromPdf,
  generateCoverLetter,
  rewriteBullets,
  generateProjectDescription,
};
