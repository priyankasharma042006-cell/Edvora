import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { getUserFromHeader, readData, serializeMaterial, writeData, type Material } from "@/lib/edvora-store";
import { allowedMaterialExtensions, getMaterialContentType, saveMaterialFile, removeMaterialFile } from "@/lib/material-storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function GET(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const subjectId = url.searchParams.get("subjectId");
  const data = readData();

  if (subjectId && !data.subjects.some((subject) => subject.id === subjectId && subject.userId === user.id && !subject.archived)) {
    return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  }

  return NextResponse.json(data.materials
    .filter((material) => material.userId === user.id && (!subjectId || material.subjectId === subjectId))
    .map(serializeMaterial));
}

export async function POST(request: Request) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload must use multipart form data." }, { status: 400 });
  }

  const uploads = formData.getAll("file");
  if (uploads.length !== 1) {
    return NextResponse.json({ error: "Upload exactly one file per request." }, { status: 400 });
  }
  const upload = uploads[0];
  const subjectId = String(formData.get("subjectId") || "");
  if (!(upload instanceof File) || !subjectId) {
    return NextResponse.json({ error: "A subject and file are required." }, { status: 400 });
  }
  if (upload.size === 0) {
    return NextResponse.json({ error: "The selected file is empty." }, { status: 400 });
  }
  if (upload.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Files must be 25 MB or smaller." }, { status: 413 });
  }

  const extension = path.extname(upload.name).slice(1).toLowerCase();
  if (!allowedMaterialExtensions.includes(extension)) {
    return NextResponse.json({ error: "Unsupported file type. Upload PDF, PPT/PPTX, DOC/DOCX, TXT, PNG, or JPG files." }, { status: 415 });
  }
  const declaredType = upload.type.split(";")[0].trim().toLowerCase();
  const expectedType = getMaterialContentType(extension);
  const alternateTypes: Record<string, string[]> = {
    pdf: ["application/x-pdf"],
    jpg: ["image/jpg"],
    jpeg: ["image/jpg"],
  };
  if (
    declaredType &&
    declaredType !== expectedType &&
    declaredType !== "application/octet-stream" &&
    !alternateTypes[extension]?.includes(declaredType)
  ) {
    return NextResponse.json({ error: "The file extension and detected file type do not match." }, { status: 415 });
  }

  const data = readData();
  const subject = data.subjects.find((item) => item.id === subjectId && item.userId === user.id && !item.archived);
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  const id = randomUUID();
  const storageKey = `${id}.${extension}`;
  const fileName = upload.name.split(/[\\/]/).at(-1)?.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 240) || `material.${extension}`;
  const material: Material = {
    id,
    userId: user.id,
    subjectId,
    fileName,
    fileType: extension,
    mimeType: getMaterialContentType(extension),
    fileSize: upload.size,
    uploadedAt: new Date().toISOString(),
    status: "stored",
    pages: 0,
    topics: [],
    source: fileName,
    storageKey,
  };

  try {
    await saveMaterialFile(storageKey, Buffer.from(await upload.arrayBuffer()));
    data.materials.push(material);
    writeData(data);
  } catch (error) {
    await removeMaterialFile(storageKey);
    const message = error instanceof Error ? error.message : "The file could not be saved.";
    console.error("Material upload failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(serializeMaterial(material), { status: 201 });
}
