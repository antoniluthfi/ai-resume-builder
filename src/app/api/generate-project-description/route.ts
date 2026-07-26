import { NextRequest, NextResponse } from "next/server";
import { getLlmClient } from "@/lib/llm";
import { isLlmProvider } from "@/lib/llm/types";
import { friendlyLlmErrorMessage } from "@/lib/llm/errorMessage";
import { fetchPageMetadata, PageMetadata } from "@/lib/scrapeMetadata";

interface GenerateProjectDescriptionRequestBody {
  url: string;
  provider: string;
  apiKey: string;
}

export async function POST(request: NextRequest) {
  let body: GenerateProjectDescriptionRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, provider, apiKey } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  if (!isLlmProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key for the selected provider" }, { status: 400 });
  }

  let metadata: PageMetadata;
  try {
    metadata = await fetchPageMetadata(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't fetch that link";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const descriptionSnippets = metadata.description
      ? metadata.description
          .split("\n")
          .map((snippet, i) => `${i + 1}. ${snippet}`)
          .join("\n")
      : "(none found)";
    const pageText = [
      `Page title: ${metadata.title || "(none found)"}`,
      metadata.category ? `Category: ${metadata.category}` : null,
      `Description snippets:\n${descriptionSnippets}`,
    ]
      .filter(Boolean)
      .join("\n");

    const description = await getLlmClient(provider).generateProjectDescription(apiKey, pageText);
    return NextResponse.json({ description });
  } catch (error) {
    console.error("generate-project-description failed", error);
    return NextResponse.json(
      { error: friendlyLlmErrorMessage(error, "Description generation failed") },
      { status: 500 }
    );
  }
}
