import { NextResponse } from "next/server";
import { listAvailableProviders } from "@/lib/llm";

export async function GET() {
  return NextResponse.json({ providers: listAvailableProviders() });
}
