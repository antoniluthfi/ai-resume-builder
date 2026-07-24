import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ResumeData } from "@/types/resume";

const MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set on the server");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export interface RawAiSuggestion {
  path: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface AnalyzeJdResult {
  missingSkills: string[];
  suggestions: RawAiSuggestion[];
}

const SYSTEM_PROMPT = `You help job seekers tailor their resume to a specific job description for ATS keyword matching.

Rules:
- Never invent experience, skills, employers, or achievements the candidate did not provide.
- Only reword or rephrase EXISTING resume bullets/summary text to naturally surface keywords from the job description that are genuinely supported by that bullet's content.
- "missingSkills" are skills/requirements from the job description not found anywhere in the resume - list them so the human can decide whether to add them (only if true).
- Respond with ONLY valid JSON matching this exact TypeScript shape, no prose, no markdown fences:
{"missingSkills": string[], "suggestions": {"path": string, "original": string, "suggested": string, "reason": string}[]}

Valid "path" values (must match the resume JSON given to you exactly):
- "summary"
- "experience[<index>].bullets[<index>]"
- "projects[<index>].bullets[<index>]" (only if that project has bullets)
Keep "suggested" the same general length/tone as "original". Limit to at most 6 suggestions, prioritizing the highest-impact keyword gaps.`;

export async function analyzeJobMatch(
  resume: ResumeData,
  jobDescription: string
): Promise<AnalyzeJdResult> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
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

  const parsed = JSON.parse(extractJson(textBlock.text)) as AnalyzeJdResult;
  return {
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  };
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) return trimmed;
  return trimmed.slice(start, end + 1);
}
