import { NextResponse } from "next/server";
import { getUserFromHeader, readData } from "@/lib/edvora-store";

export async function GET(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = readData();
  return NextResponse.json(data.conversations.filter((conversation) => conversation.userId === user.id));
}
