import "server-only";
import OpenAI from "openai";
import { ParsedResumeData, ResumeData } from "@/types/resume";
import { AnalyzeJdResult, LlmClient } from "./types";
import { ANALYZE_JD_SYSTEM_PROMPT, PARSE_RESUME_SYSTEM_PROMPT, extractJson } from "./prompts";
import { normalizeAnalyzeResult, normalizeParsedResume } from "./normalize";

const MODEL = "gpt-5.4-mini";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set on the server");
  }
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

async function analyzeJobMatch(resume: ResumeData, jobDescription: string): Promise<AnalyzeJdResult> {
  const openai = getClient();

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

async function parseResumeFromPdf(base64Pdf: string): Promise<ParsedResumeData> {
  const openai = getClient();

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

export const openaiClient: LlmClient = { analyzeJobMatch, parseResumeFromPdf };
