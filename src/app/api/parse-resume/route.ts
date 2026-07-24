import { NextRequest, NextResponse } from "next/server";
import { parseResumeFromPdf } from "@/lib/anthropic";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a 'file' field" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResumeFromPdf(buffer.toString("base64"));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("parse-resume failed", error);
    const message = error instanceof Error ? error.message : "Resume parsing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
