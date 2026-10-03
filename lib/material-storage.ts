import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_DIRECTORY = path.join(process.cwd(), "data", "uploads");

const contentTypes: Record<string, string> = {
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export const allowedMaterialExtensions = Object.keys(contentTypes);

export function getMaterialContentType(extension: string) {
  return contentTypes[extension.toLowerCase()] ?? "application/octet-stream";
}

function getStoragePath(storageKey: string) {
  if (!/^[0-9a-f-]+\.[a-z0-9]+$/i.test(storageKey)) {
    throw new Error("Invalid material storage key.");
  }

  return path.join(STORAGE_DIRECTORY, storageKey);
}

export async function saveMaterialFile(storageKey: string, contents: Buffer) {
  await mkdir(STORAGE_DIRECTORY, { recursive: true });
  await writeFile(getStoragePath(storageKey), contents, { flag: "wx" });
}

export async function readMaterialFile(storageKey: string) {
  return readFile(getStoragePath(storageKey));
}

export async function removeMaterialFile(storageKey: string) {
  try {
    await unlink(getStoragePath(storageKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
