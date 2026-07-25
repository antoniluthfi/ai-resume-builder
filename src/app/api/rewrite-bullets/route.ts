import { NextRequest, NextResponse } from "next/server";
import { getLlmClient } from "@/lib/llm";
import { isLlmProvider, RawBulletIssue } from "@/lib/llm/types";
import { friendlyLlmErrorMessage } from "@/lib/llm/errorMessage";
import { ResumeData } from "@/types/resume";

interface RewriteBulletsRequestBody {
  resume: ResumeData;
  issues: RawBulletIssue[];
  provider: string;
  apiKey: string;
}

export async function POST(request: NextRequest) {
  let body: RewriteBulletsRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { resume, issues, provider, apiKey } = body;
  if (!resume || !Array.isArray(issues) || issues.length === 0) {
    return NextResponse.json(
      { error: "resume and a non-empty issues array are required" },
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
    const result = await getLlmClient(provider).rewriteBullets(apiKey, resume, issues);
    return NextResponse.json({ rewrites: result });
  } catch (error) {
    console.error("rewrite-bullets failed", error);
    return NextResponse.json({ error: friendlyLlmErrorMessage(error, "Rewrite failed") }, { status: 500 });
  }
}
