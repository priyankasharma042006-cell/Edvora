import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getUserFromHeader, readData, Subject, writeData } from "@/lib/edvora-store";

export async function GET(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = readData();
  return NextResponse.json(data.subjects
    .filter((subject) => subject.userId === user.id && !subject.archived)
    .map((subject) => ({
      ...subject,
      materialCount: data.materials.filter((material) => material.userId === user.id && material.subjectId === subject.id).length,
    })));
}

export async function POST(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Subject name is required." }, { status: 400 });
  if (name.length > 80) return NextResponse.json({ error: "Subject names must be 80 characters or fewer." }, { status: 400 });
  if (String(body.description || "").length > 500) {
    return NextResponse.json({ error: "Descriptions must be 500 characters or fewer." }, { status: 400 });
  }

  const data = readData();
  if (data.subjects.some((item) =>
    item.userId === user.id && !item.archived && item.name.toLowerCase() === name.toLowerCase(),
  )) {
    return NextResponse.json({ error: "You already have a subject with this name." }, { status: 409 });
  }

  const subject: Subject = {
    id: `subject-${randomUUID()}`,
    userId: user.id,
    name,
    description: String(body.description || ""),
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: data.subjects.filter((item) => item.userId === user.id).length + 1,
  };

  data.subjects.push(subject);
  writeData(data);
  return NextResponse.json(subject, { status: 201 });
}
