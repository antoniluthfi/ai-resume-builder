import "server-only";
import Anthropic from "@anthropic-ai/sdk";
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

const MODEL = "claude-haiku-4-5-20251001";

async function analyzeJobMatch(
  apiKey: string,
  resume: ResumeData,
  jobDescription: string
): Promise<AnalyzeJdResult> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: ANALYZE_JD_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME JSON:\n${JSON.stringify(resume, null, 2)}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return normalizeAnalyzeResult(JSON.parse(extractJson(textBlock.text)));
}

async function parseResumeFromPdf(apiKey: string, base64Pdf: string): Promise<ParsedResumeData> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: PARSE_RESUME_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64Pdf },
          },
          {
            type: "text",
            text: "Extract this resume into the JSON shape described in the system prompt.",
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return normalizeParsedResume(JSON.parse(extractJson(textBlock.text)));
}

async function generateCoverLetter(
  apiKey: string,
  resume: ResumeData,
  jobDescription: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: COVER_LETTER_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME JSON:\n${JSON.stringify(resume, null, 2)}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text.trim();
}

async function rewriteBullets(
  apiKey: string,
  resume: ResumeData,
  issues: RawBulletIssue[],
  projectLinkContext?: Record<number, RawProjectLinkContext>
): Promise<RawBulletRewrite[]> {
  const anthropic = new Anthropic({ apiKey });

  const linkContextText =
    projectLinkContext && Object.keys(projectLinkContext).length > 0
      ? `\n\nFETCHED PROJECT LINK CONTEXT (by project index):\n${JSON.stringify(projectLinkContext, null, 2)}`
      : "";

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: REWRITE_BULLET_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `RESUME JSON:\n${JSON.stringify(resume, null, 2)}\n\nFLAGGED BULLETS:\n${JSON.stringify(issues, null, 2)}${linkContextText}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return normalizeBulletRewrites(JSON.parse(extractJson(textBlock.text)));
}

async function generateProjectDescription(apiKey: string, pageText: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: GENERATE_PROJECT_DESCRIPTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: pageText }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text.trim();
}

export const anthropicClient: LlmClient = {
  analyzeJobMatch,
  parseResumeFromPdf,
  generateCoverLetter,
  rewriteBullets,
  generateProjectDescription,
};
