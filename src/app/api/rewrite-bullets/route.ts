import { NextRequest, NextResponse } from "next/server";
import { getLlmClient } from "@/lib/llm";
import { isLlmProvider, RawBulletIssue, RawProjectLinkContext } from "@/lib/llm/types";
import { friendlyLlmErrorMessage } from "@/lib/llm/errorMessage";
import { fetchPageMetadata } from "@/lib/scrapeMetadata";
import { ResumeData } from "@/types/resume";

interface RewriteBulletsRequestBody {
  resume: ResumeData;
  issues: RawBulletIssue[];
  provider: string;
  apiKey: string;
}

const PROJECT_PATH_PATTERN = /^projects\[(\d+)\]/;

/**
 * Best-effort: fetches the first link of each project that has a flagged
 * bullet, so the rewrite has real project context to draw on beyond what's
 * already typed into the resume. A project with no link, or whose link
 * fails/times out, is silently skipped - this is supplementary context, not
 * something that should ever fail the whole rewrite request.
 */
async function gatherProjectLinkContext(
  resume: ResumeData,
  issues: RawBulletIssue[]
): Promise<Record<number, RawProjectLinkContext>> {
  const projectIndices = new Set<number>();
  for (const issue of issues) {
    const match = issue.path.match(PROJECT_PATH_PATTERN);
    if (match) projectIndices.add(Number(match[1]));
  }

  const entries = await Promise.allSettled(
    Array.from(projectIndices).map(async (index) => {
      const url = resume.projects[index]?.links?.find(Boolean);
      if (!url) return null;
      const metadata = await fetchPageMetadata(url);
      return [index, { title: metadata.title, description: metadata.description }] as const;
    })
  );

  const context: Record<number, RawProjectLinkContext> = {};
  for (const result of entries) {
    if (result.status === "fulfilled" && result.value) {
      const [index, metadata] = result.value;
      context[index] = metadata;
    }
  }
  return context;
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
    const projectLinkContext = await gatherProjectLinkContext(resume, issues);
    const result = await getLlmClient(provider).rewriteBullets(apiKey, resume, issues, projectLinkContext);
    return NextResponse.json({ rewrites: result });
  } catch (error) {
    console.error("rewrite-bullets failed", error);
    return NextResponse.json({ error: friendlyLlmErrorMessage(error, "Rewrite failed") }, { status: 500 });
  }
}
