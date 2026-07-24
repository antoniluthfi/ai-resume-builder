import { NextRequest, NextResponse } from "next/server";
import { getLlmClient } from "@/lib/llm";
import { isLlmProvider } from "@/lib/llm/types";
import { ResumeData } from "@/types/resume";

interface CoverLetterRequestBody {
  jobDescription: string;
  resume: ResumeData;
  provider: string;
  apiKey: string;
}

export async function POST(request: NextRequest) {
  let body: CoverLetterRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobDescription, resume, provider, apiKey } = body;
  if (!jobDescription || typeof jobDescription !== "string" || !resume) {
    return NextResponse.json(
      { error: "jobDescription (string) and resume are required" },
      { status: 400 }
    );
  }

  if (!isLlmProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key for the selected provider" }, { status: 400 });
  }

  try {
    const coverLetter = await getLlmClient(provider).generateCoverLetter(apiKey, resume, jobDescription);
    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("cover-letter failed", error);
    const message = error instanceof Error ? error.message : "Cover letter generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
