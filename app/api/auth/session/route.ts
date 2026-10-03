import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/edvora-store";

export async function DELETE(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  deleteSession(token);
  return NextResponse.json({ success: true });
}
