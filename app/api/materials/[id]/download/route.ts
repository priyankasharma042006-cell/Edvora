import { NextResponse } from "next/server";
import { getUserFromHeader, readData } from "@/lib/edvora-store";
import { getMaterialContentType, readMaterialFile } from "@/lib/material-storage";

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext<"/api/materials/[id]/download">) {
  const user = getUserFromHeader(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const material = readData().materials.find((item) => item.id === id && item.userId === user.id);
  if (!material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
  if (!material.storageKey) return NextResponse.json({ error: "This older material has no stored file. Upload it again to enable downloads." }, { status: 410 });

  try {
    const contents = await readMaterialFile(material.storageKey);
    const filename = encodeURIComponent(material.fileName);
    return new Response(contents, {
      headers: {
        "Content-Type": material.mimeType || getMaterialContentType(material.fileType),
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Content-Length": String(contents.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Material download failed:", error);
    return NextResponse.json({ error: "The stored file could not be read." }, { status: 500 });
  }
}
