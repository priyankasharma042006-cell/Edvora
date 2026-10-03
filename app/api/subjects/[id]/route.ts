import { NextResponse } from "next/server";
import { getUserFromHeader, readData, serializeMaterial, writeData } from "@/lib/edvora-store";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = readData();
  const subject = data.subjects.find((item) => item.id === id && item.userId === user.id && !item.archived);
  if (!subject) return NextResponse.json({ error: "Subject not found" }, { status: 404 });

  return NextResponse.json({
    subject,
    materials: data.materials
      .filter((material) => material.userId === user.id && material.subjectId === id)
      .map(serializeMaterial),
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json();
  const data = readData();
  const subject = data.subjects.find((item) => item.id === id && item.userId === user.id && !item.archived);
  if (!subject) return NextResponse.json({ error: "Subject not found" }, { status: 404 });

  subject.name = String(body.name || subject.name);
  subject.description = String(body.description || subject.description);
  subject.updatedAt = new Date().toISOString();
  writeData(data);

  return NextResponse.json(subject);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = readData();
  const subject = data.subjects.find((item) => item.id === id && item.userId === user.id && !item.archived);
  if (!subject) return NextResponse.json({ error: "Subject not found" }, { status: 404 });

  subject.archived = true;
  subject.updatedAt = new Date().toISOString();
  writeData(data);
  return NextResponse.json({ success: true });
}
