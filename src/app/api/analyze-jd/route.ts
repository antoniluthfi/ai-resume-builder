import { NextRequest, NextResponse } from "next/server";
import { getLlmClient, listAvailableProviders } from "@/lib/llm";
import { isLlmProvider } from "@/lib/llm/types";
import { ResumeData } from "@/types/resume";

interface AnalyzeJdRequestBody {
  jobDescription: string;
  resume: ResumeData;
  provider: string;
}

export async function POST(request: NextRequest) {
  let body: AnalyzeJdRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobDescription, resume, provider } = body;
  if (!jobDescription || typeof jobDescription !== "string" || !resume) {
    return NextResponse.json(
      { error: "jobDescription (string) and resume are required" },
      { status: 400 }
    );
  }

  if (!isLlmProvider(provider) || !listAvailableProviders().includes(provider)) {
    return NextResponse.json({ error: "Unknown or unconfigured provider" }, { status: 400 });
  }

  try {
    const result = await getLlmClient(provider).analyzeJobMatch(resume, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error("analyze-jd failed", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
