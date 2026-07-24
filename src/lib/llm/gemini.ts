import "server-only";
import { GoogleGenAI } from "@google/genai";
import { ParsedResumeData, ResumeData } from "@/types/resume";
import { AnalyzeJdResult, LlmClient } from "./types";
import { ANALYZE_JD_SYSTEM_PROMPT, PARSE_RESUME_SYSTEM_PROMPT, extractJson } from "./prompts";
import { normalizeAnalyzeResult, normalizeParsedResume } from "./normalize";

const MODEL = "gemini-flash-latest";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set on the server");
  }
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

async function analyzeJobMatch(resume: ResumeData, jobDescription: string): Promise<AnalyzeJdResult> {
  const gemini = getClient();

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

async function parseResumeFromPdf(base64Pdf: string): Promise<ParsedResumeData> {
  const gemini = getClient();

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

export const geminiClient: LlmClient = { analyzeJobMatch, parseResumeFromPdf };
