import { NextResponse } from "next/server";
import { createSession, hashPassword, readData, verifyPassword, writeData } from "@/lib/edvora-store";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const data = readData();
  const user = data.users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.passwordHash.startsWith("sha256:")) {
    user.passwordHash = hashPassword(String(password));
    user.updatedAt = new Date().toISOString();
  }

  const token = createSession(data, user.id);
  writeData(data);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
}
