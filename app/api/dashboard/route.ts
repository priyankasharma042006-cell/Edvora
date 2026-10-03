import { NextResponse } from "next/server";
import { getDashboardState, getUserFromHeader } from "@/lib/edvora-store";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const user = getUserFromHeader(authHeader);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getDashboardState(user.id));
}
