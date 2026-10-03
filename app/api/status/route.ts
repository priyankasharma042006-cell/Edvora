import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    supportedTextExtraction: ["txt"],
    storageMode: "local filesystem",
    maxUploadBytes: 25 * 1024 * 1024,
  });
}
