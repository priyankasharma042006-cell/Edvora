"use client";

import { ChangeEvent, useRef, useState } from "react";
import { formatFileSize } from "@/lib/format-file-size";
import type { MaterialMetadata } from "@/lib/material-types";

const allowedExtensions = new Set(["pdf", "ppt", "pptx", "doc", "docx", "txt", "png", "jpg", "jpeg"]);
const maxFileSize = 25 * 1024 * 1024;
const allowedFileTypes = ".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg";

export function MaterialUpload({
  subjectId,
  onUploaded,
}: {
  subjectId: string;
  onUploaded: (material: MaterialMetadata) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const valid: File[] = [];
    const problems: string[] = [];

    for (const file of selected) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowedExtensions.has(extension)) {
        problems.push(`${file.name}: unsupported file type.`);
      } else if (file.size === 0) {
        problems.push(`${file.name}: file is empty.`);
      } else if (file.size > maxFileSize) {
        problems.push(`${file.name}: files must be 25 MB or smaller.`);
      } else {
        valid.push(file);
      }
    }

    setFiles((current) => [...current, ...valid]);
    setError(problems.join(" "));
    setMessage("");
    event.target.value = "";
  };

  const uploadFiles = async () => {
    if (!subjectId || files.length === 0 || uploading) return;

    const token = localStorage.getItem("edvora-token");
    if (!token) {
      setError("Please sign in before uploading learning materials.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");
    let completed = 0;
    const failures: string[] = [];
    const failedFiles: File[] = [];

    for (const file of files) {
      const form = new FormData();
      form.set("subjectId", subjectId);
      form.set("file", file);

      try {
        const response = await fetch("/api/materials", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const payload = await response.json() as MaterialMetadata | { error?: string };
        if (!response.ok || !("id" in payload)) {
          failures.push(`${file.name}: ${"error" in payload ? payload.error : "Upload failed."}`);
          failedFiles.push(file);
          continue;
        }
        onUploaded(payload);
        completed += 1;
      } catch (uploadError) {
        failures.push(`${file.name}: ${uploadError instanceof Error ? uploadError.message : "Upload failed."}`);
        failedFiles.push(file);
      }
    }

    setFiles(failedFiles);
    setUploading(false);
    setMessage(completed > 0 ? `${completed} file${completed === 1 ? "" : "s"} saved to this local Edvora project.` : "");
    setError(failures.join(" "));
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Upload study materials</h3>
          <p className="mt-1 text-sm text-slate-600">Files are stored locally with this subject in this project. Maximum 25 MB per file.</p>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">PDF · Office · TXT · Images</span>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Choose files from your device</span>
          <input
            ref={inputRef}
            type="file"
            accept={allowedFileTypes}
            multiple
            disabled={!subjectId || uploading}
            onChange={handleFileChange}
            className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:font-medium file:text-white hover:file:bg-slate-700 disabled:opacity-50"
          />
        </label>
      </div>

      {files.length > 0 ? (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-800">{file.name}</span>
              <span className="shrink-0 text-slate-500">{file.name.split(".").pop()?.toUpperCase()} · {formatFileSize(file.size)}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={uploadFiles} disabled={uploading || !subjectId} className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60">
              {uploading ? "Uploading…" : `Upload ${files.length} file${files.length === 1 ? "" : "s"}`}
            </button>
            <button type="button" onClick={() => setFiles([])} disabled={uploading} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      {message ? <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
      {!subjectId ? <p className="mt-3 text-sm text-amber-700">Create or select a subject before uploading.</p> : null}
    </section>
  );
}
