import { NextResponse } from "next/server";
import { getUserFromHeader, readData } from "@/lib/edvora-store";

export async function GET(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();
  if (!query) return NextResponse.json({ results: [] });

  const data = readData();
  const results: { type: string; title: string; meta: string; href: string }[] = [];

  data.subjects.filter((subject) => subject.userId === user.id && !subject.archived && subject.name.toLowerCase().includes(query)).forEach((subject) => {
    results.push({ type: "Subject", title: subject.name, meta: "Subject overview", href: `/subjects/${subject.id}` });
  });

  data.materials.filter((material) => material.userId === user.id && material.fileName.toLowerCase().includes(query)).forEach((material) => {
    results.push({ type: "Document", title: material.fileName, meta: `${material.fileType.toUpperCase()} • ${material.status}`, href: `/materials/${material.id}` });
  });

  data.conversations.filter((conversation) => conversation.userId === user.id && conversation.title.toLowerCase().includes(query)).forEach((conversation) => {
    results.push({ type: "Conversation", title: conversation.title, meta: "Conversation history", href: "/chat-history" });
  });

  data.quizAttempts.filter((attempt) => attempt.userId === user.id && attempt.topic.toLowerCase().includes(query)).forEach((attempt) => {
    results.push({ type: "Quiz", title: attempt.topic, meta: `${attempt.accuracy}% score`, href: "/quizzes" });
  });

  return NextResponse.json({ results: results.slice(0, 8) });
}
