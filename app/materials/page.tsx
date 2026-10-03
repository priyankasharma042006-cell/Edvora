"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";
import { MaterialUpload } from "@/components/material-upload";
import { formatFileSize } from "@/lib/format-file-size";
import type { MaterialMetadata } from "@/lib/material-types";

type Subject = { id: string; name: string };

export default function MaterialsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<MaterialMetadata[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("edvora-token") ?? "";
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
        fetch("/api/subjects", { headers }),
        fetch("/api/materials", { headers }),
      ])
      .then(async ([subjectsResponse, materialsResponse]) => {
      if (!subjectsResponse.ok || !materialsResponse.ok) {
        throw new Error("Your materials could not be loaded. Please refresh and try again.");
      }
      const [subjectData, materialData] = await Promise.all([
        subjectsResponse.json() as Promise<Subject[]>,
        materialsResponse.json() as Promise<MaterialMetadata[]>,
      ]);
      if (cancelled) return;
      setSubjects(subjectData);
      setMaterials(materialData);
      setSelectedSubject((current) => current || subjectData[0]?.id || "");
      setError("");
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Your materials could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return materials.filter((material) => {
      const matchesSubject = !selectedSubject || material.subjectId === selectedSubject;
      const subjectName = subjects.find((subject) => subject.id === material.subjectId)?.name ?? "";
      const matchesQuery = !normalizedQuery ||
        material.fileName.toLowerCase().includes(normalizedQuery) ||
        subjectName.toLowerCase().includes(normalizedQuery);
      return matchesSubject && matchesQuery;
    });
  }, [materials, query, selectedSubject, subjects]);

  const downloadMaterial = async (material: MaterialMetadata) => {
    const token = localStorage.getItem("edvora-token");
    if (!token) return setActionError("Sign in to download this file.");
    try {
      const response = await fetch(`/api/materials/${material.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "The file could not be downloaded.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = material.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setActionError("");
    } catch (downloadError) {
      setActionError(downloadError instanceof Error ? downloadError.message : "The file could not be downloaded.");
    }
  };

  const deleteMaterial = async (material: MaterialMetadata) => {
    if (!window.confirm(`Delete “${material.fileName}” from this project?`)) return;
    const token = localStorage.getItem("edvora-token");
    if (!token) return setActionError("Sign in to delete this file.");
    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "The file could not be deleted.");
      }
      setMaterials((current) => current.filter((item) => item.id !== material.id));
      setActionError("");
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "The file could not be deleted.");
    }
  };

  return (
    <DashboardLayout title="Study Materials" subtitle="Files organized by subject">
      {error ? <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Save files under subject</span>
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                disabled={subjects.length === 0}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none focus:border-cyan-400"
              >
                {subjects.length === 0 ? <option value="">Create a subject first</option> : null}
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
          </div>
          <MaterialUpload
            subjectId={selectedSubject}
            onUploaded={(material) => setMaterials((current) => [material, ...current])}
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Your files</h3>
              <p className="mt-1 text-sm text-slate-500">{filteredMaterials.length} material{filteredMaterials.length === 1 ? "" : "s"}</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search materials"
              placeholder="Filter by file or subject"
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cyan-400"
            />
          </div>

          {actionError ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
          {loading ? <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-slate-600">Loading materials…</p> : null}
          {!loading && subjects.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">
              <p>Create a subject before adding materials.</p>
              <Link href="/subjects" className="mt-3 inline-block font-medium text-cyan-800 underline">Go to subjects</Link>
            </div>
          ) : null}
          {!loading && subjects.length > 0 && filteredMaterials.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">
              {query ? "No files match your search." : "No materials in this subject yet. Choose files above to add your first resource."}
            </div>
          ) : null}
          <div className="mt-5 space-y-3">
            {filteredMaterials.map((material) => (
              <article key={material.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/materials/${material.id}`} className="break-all font-semibold text-slate-900 hover:text-cyan-800">{material.fileName}</Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {subjects.find((subject) => subject.id === material.subjectId)?.name ?? "Subject"} · {material.fileType.toUpperCase()} · {formatFileSize(material.fileSize)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Added {new Date(material.uploadedAt).toLocaleDateString()} · {material.storedLocally ? "Stored locally" : "File must be uploaded again"}</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{material.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/materials/${material.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">View details</Link>
                  <button type="button" onClick={() => void downloadMaterial(material)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Download</button>
                  <button type="button" onClick={() => void deleteMaterial(material)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
