import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession, hashPassword, readData, User, writeData } from "@/lib/edvora-store";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (String(name).trim().length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
  }

  const data = readData();
  const existing = data.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user: User = {
    id: `user-${randomUUID()}`,
    name: String(name),
    email: String(email).toLowerCase(),
    passwordHash: hashPassword(String(password)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.users.push(user);
  const token = createSession(data, user.id);
  writeData(data);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token }, { status: 201 });
}
