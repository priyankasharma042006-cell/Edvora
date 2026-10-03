import { NextResponse } from "next/server";
import { getUserFromHeader, readData } from "@/lib/edvora-store";

export async function GET(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempts = readData().quizAttempts
    .filter((attempt) => attempt.userId === user.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return NextResponse.json({ attempts });
}
