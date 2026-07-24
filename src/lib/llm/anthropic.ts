import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ParsedResumeData, ResumeData } from "@/types/resume";
import { AnalyzeJdResult, LlmClient } from "./types";
import { ANALYZE_JD_SYSTEM_PROMPT, PARSE_RESUME_SYSTEM_PROMPT, extractJson } from "./prompts";
import { normalizeAnalyzeResult, normalizeParsedResume } from "./normalize";

const MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set on the server");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

async function analyzeJobMatch(resume: ResumeData, jobDescription: string): Promise<AnalyzeJdResult> {
  const anthropic = getClient();

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

async function parseResumeFromPdf(base64Pdf: string): Promise<ParsedResumeData> {
  const anthropic = getClient();

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

export const anthropicClient: LlmClient = { analyzeJobMatch, parseResumeFromPdf };
