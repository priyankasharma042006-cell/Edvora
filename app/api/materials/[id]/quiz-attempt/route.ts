import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getUserFromHeader, readData, writeData } from "@/lib/edvora-store";

export async function POST(request: Request, context: RouteContext<"/api/materials/[id]/quiz-attempt">) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = readData();
  const material = data.materials.find((item) => item.id === id && item.userId === user.id);
  if (!material) return NextResponse.json({ error: "Material not found." }, { status: 404 });

  let body: { score?: number; total?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid quiz result is required." }, { status: 400 });
  }

  const { score, total } = body;
  if (
    typeof score !== "number" || typeof total !== "number" ||
    !Number.isInteger(score) || !Number.isInteger(total) ||
    total < 1 || total > 20 || score < 0 || score > total
  ) {
    return NextResponse.json({ error: "Quiz score must be an integer between zero and a total of 1–20." }, { status: 400 });
  }

  const attempt = {
    id: `attempt-${randomUUID()}`,
    userId: user.id,
    subjectId: material.subjectId,
    topic: material.fileName.slice(0, 120),
    score,
    total,
    accuracy: Math.round((score / total) * 100),
    createdAt: new Date().toISOString(),
  };
  data.quizAttempts.push(attempt);
  writeData(data);
  return NextResponse.json({ attempt }, { status: 201 });
}
