import "server-only";
import OpenAI from "openai";
import { ParsedResumeData, ResumeData } from "@/types/resume";
import {
  AnalyzeJdResult,
  CoverLetterResult,
  LlmClient,
  RawBulletIssue,
  RawBulletRewrite,
  RawProjectLinkContext,
} from "./types";
import {
  ANALYZE_JD_SYSTEM_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT,
  GENERATE_PROJECT_DESCRIPTION_SYSTEM_PROMPT,
  PARSE_RESUME_SYSTEM_PROMPT,
  REWRITE_BULLET_SYSTEM_PROMPT,
  extractJson,
} from "./prompts";
import {
  normalizeAnalyzeResult,
  normalizeBulletRewrites,
  normalizeCoverLetter,
  normalizeParsedResume,
} from "./normalize";

const MODEL = "gpt-5.4-mini";

async function analyzeJobMatch(
  apiKey: string,
  resume: ResumeData,
  jobDescription: string
): Promise<AnalyzeJdResult> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.responses.create({
    model: MODEL,
    instructions: ANALYZE_JD_SYSTEM_PROMPT,
    text: { format: { type: "json_object" } },
    input: [
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME JSON:\n${JSON.stringify(resume, null, 2)}`,
      },
    ],
  });

  return normalizeAnalyzeResult(JSON.parse(extractJson(response.output_text)));
}

async function parseResumeFromPdf(apiKey: string, base64Pdf: string): Promise<ParsedResumeData> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.responses.create({
    model: MODEL,
    instructions: PARSE_RESUME_SYSTEM_PROMPT,
    text: { format: { type: "json_object" } },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename: "resume.pdf",
            file_data: `data:application/pdf;base64,${base64Pdf}`,
          },
          {
            type: "input_text",
            text: "Extract this resume into the JSON shape described in the instructions.",
          },
        ],
      },
    ],
  });

  return normalizeParsedResume(JSON.parse(extractJson(response.output_text)));
}

async function generateCoverLetter(
  apiKey: string,
  resume: ResumeData,
  jobDescription: string
): Promise<CoverLetterResult> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.responses.create({
    model: MODEL,
    instructions: COVER_LETTER_SYSTEM_PROMPT,
    text: { format: { type: "json_object" } },
    input: [
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME JSON:\n${JSON.stringify(resume, null, 2)}`,
      },
    ],
  });

  return normalizeCoverLetter(JSON.parse(extractJson(response.output_text)));
}

async function rewriteBullets(
  apiKey: string,
  resume: ResumeData,
  issues: RawBulletIssue[],
  projectLinkContext?: Record<number, RawProjectLinkContext>
): Promise<RawBulletRewrite[]> {
  const openai = new OpenAI({ apiKey });

  const linkContextText =
    projectLinkContext && Object.keys(projectLinkContext).length > 0
      ? `\n\nFETCHED PROJECT LINK CONTEXT (by project index):\n${JSON.stringify(projectLinkContext, null, 2)}`
      : "";

  const response = await openai.responses.create({
    model: MODEL,
    instructions: REWRITE_BULLET_SYSTEM_PROMPT,
    text: { format: { type: "json_object" } },
    input: [
      {
        role: "user",
        content: `RESUME JSON:\n${JSON.stringify(resume, null, 2)}\n\nFLAGGED BULLETS:\n${JSON.stringify(issues, null, 2)}${linkContextText}`,
      },
    ],
  });

  return normalizeBulletRewrites(JSON.parse(extractJson(response.output_text)));
}

async function generateProjectDescription(apiKey: string, pageText: string): Promise<string> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.responses.create({
    model: MODEL,
    instructions: GENERATE_PROJECT_DESCRIPTION_SYSTEM_PROMPT,
    input: [{ role: "user", content: pageText }],
  });

  return response.output_text.trim();
}

export const openaiClient: LlmClient = {
  analyzeJobMatch,
  parseResumeFromPdf,
  generateCoverLetter,
  rewriteBullets,
  generateProjectDescription,
};
