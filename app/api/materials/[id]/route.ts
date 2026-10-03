import { NextResponse } from "next/server";
import { getUserFromHeader, readData, serializeMaterial, writeData } from "@/lib/edvora-store";
import { removeMaterialFile } from "@/lib/material-storage";

export async function GET(request: Request, context: RouteContext<"/api/materials/[id]">) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const material = readData().materials.find((item) => item.id === id && item.userId === user.id);
  if (!material) return NextResponse.json({ error: "Material not found." }, { status: 404 });

  return NextResponse.json(serializeMaterial(material));
}

export async function DELETE(request: Request, context: RouteContext<"/api/materials/[id]">) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = readData();
  const index = data.materials.findIndex((item) => item.id === id && item.userId === user.id);
  if (index < 0) return NextResponse.json({ error: "Material not found." }, { status: 404 });

  const [material] = data.materials.splice(index, 1);
  try {
    if (material.storageKey) await removeMaterialFile(material.storageKey);
    writeData(data);
  } catch (error) {
    console.error("Material deletion failed:", error);
    return NextResponse.json({ error: "The material could not be deleted. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
