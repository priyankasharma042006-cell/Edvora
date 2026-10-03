import { NextResponse } from "next/server";
import { generateLearningContent, type LearningTask } from "@/lib/ai-service";
import { getUserFromHeader, readData } from "@/lib/edvora-store";
import { readMaterialFile } from "@/lib/material-storage";

const supportedTasks = new Set<LearningTask>(["summary", "notes", "quiz", "flashcards", "ask"]);

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext<"/api/materials/[id]/analyze">) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const material = readData().materials.find((item) => item.id === id && item.userId === user.id);
  if (!material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
  if (!material.storageKey) {
    return NextResponse.json({ error: "This older material has no stored file. Upload it again before analyzing it." }, { status: 410 });
  }

  if (material.fileType !== "txt") {
    return NextResponse.json({
      error: "Text extraction is not available for this file type yet. AI analysis currently supports plain .txt files.",
    }, { status: 415 });
  }

  let body: { task?: LearningTask; question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid analysis request is required." }, { status: 400 });
  }

  const task = body.task;
  if (!task || !supportedTasks.has(task)) {
    return NextResponse.json({ error: "Choose summary, notes, quiz, flashcards, or ask." }, { status: 400 });
  }
  if (task === "ask" && (typeof body.question !== "string" || !body.question.trim())) {
    return NextResponse.json({ error: "Enter a question about this material." }, { status: 400 });
  }

  try {
    const source = (await readMaterialFile(material.storageKey)).toString("utf8").trim();
    if (!source) return NextResponse.json({ error: "This text file does not contain readable text." }, { status: 422 });

    const content = await generateLearningContent(task, source, body.question);
    return NextResponse.json({ task, content, source: material.fileName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI analysis failed.";
    const status = message.includes("not configured") ? 503 : 502;
    if (status === 502) console.error("Material AI analysis failed:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
