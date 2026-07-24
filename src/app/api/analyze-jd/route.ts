import { NextRequest, NextResponse } from "next/server";
import { analyzeJobMatch } from "@/lib/anthropic";
import { ResumeData } from "@/types/resume";

interface AnalyzeJdRequestBody {
  jobDescription: string;
  resume: ResumeData;
}

export async function POST(request: NextRequest) {
  let body: AnalyzeJdRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobDescription, resume } = body;
  if (!jobDescription || typeof jobDescription !== "string" || !resume) {
    return NextResponse.json(
      { error: "jobDescription (string) and resume are required" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeJobMatch(resume, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error("analyze-jd failed", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
