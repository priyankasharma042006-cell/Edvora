import { NextResponse } from "next/server";
import { generateLearningContent } from "@/lib/ai-service";
import { getUserFromHeader, readData } from "@/lib/edvora-store";
import { readMaterialFile } from "@/lib/material-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { subjectId?: string; question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid question request is required." }, { status: 400 });
  }

  const subjectId = String(body.subjectId || "");
  const question = String(body.question || "").trim();
  if (!subjectId || !question) {
    return NextResponse.json({ error: "Subject and question are required." }, { status: 400 });
  }

  const data = readData();
  const subject = data.subjects.find((item) => item.id === subjectId && item.userId === user.id && !item.archived);
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  const sourceMaterial = data.materials.find((material) =>
    material.userId === user.id && material.subjectId === subjectId &&
    material.fileType === "txt" && material.storageKey,
  );
  if (!sourceMaterial?.storageKey) {
    return NextResponse.json({
      error: "Ask Edvora requires a plain-text (.txt) learning material. Other file types cannot currently be extracted.",
    }, { status: 415 });
  }

  try {
    const source = (await readMaterialFile(sourceMaterial.storageKey)).toString("utf8").trim();
    if (!source) return NextResponse.json({ error: "The selected text material contains no readable text." }, { status: 422 });
    const answer = await generateLearningContent("ask", source, question);
    return NextResponse.json({ answer, source: sourceMaterial.fileName, grounded: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI service request failed.";
    const status = message.includes("not configured") ? 503 : 502;
    if (status === 502) console.error("AI tutor request failed:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
