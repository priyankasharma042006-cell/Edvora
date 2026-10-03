"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";
import { MaterialUpload } from "@/components/material-upload";
import { formatFileSize } from "@/lib/format-file-size";
import type { MaterialMetadata } from "@/lib/material-types";

type Subject = { id: string; name: string; description: string; createdAt: string };

export default function SubjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [materials, setMaterials] = useState<MaterialMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("edvora-token") ?? "";
    fetch(`/api/subjects/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
      const payload = await response.json() as { subject?: Subject; materials?: MaterialMetadata[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "This subject could not be loaded.");
      if (cancelled) return null;
      setSubject(payload.subject ?? null);
      setMaterials(payload.materials ?? []);
      return payload.subject;
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "This subject could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const archiveSubject = async () => {
    if (!subject || !window.confirm(`Archive “${subject.name}”? Its materials will remain in the project.`)) return;
    const token = localStorage.getItem("edvora-token");
    if (!token) return setError("Sign in to archive this subject.");
    setArchiving(true);
    try {
      const response = await fetch(`/api/subjects/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The subject could not be archived.");
      router.replace("/subjects");
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "The subject could not be archived.");
      setArchiving(false);
    }
  };

  return (
    <DashboardLayout title={subject?.name ?? "Subject"} subtitle="Subject overview and learning materials">
      {error ? <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p> : null}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading subject…</div> : null}
      {!loading && subject ? (
        <div className="space-y-6">
          <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Subject workspace</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{subject.name}</h3>
              <p className="mt-2 max-w-3xl text-slate-600">{subject.description || "Add learning materials to organize your study resources for this subject."}</p>
              <p className="mt-3 text-sm text-slate-500">{materials.length} material{materials.length === 1 ? "" : "s"} · Created {new Date(subject.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/materials" className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950">Manage all materials</Link>
              <button type="button" onClick={() => void archiveSubject()} disabled={archiving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 disabled:opacity-60">
                {archiving ? "Archiving…" : "Archive subject"}
              </button>
            </div>
          </section>

          <MaterialUpload
            subjectId={subject.id}
            onUploaded={(material) => setMaterials((current) => [material, ...current])}
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Learning materials</h3>
                <p className="mt-1 text-sm text-slate-500">Only files uploaded to {subject.name} appear here.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{materials.length}</span>
            </div>
            {materials.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">No study materials yet. Upload your first file above.</div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {materials.map((material) => (
                  <div key={material.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <Link href={`/materials/${material.id}`} className="break-all font-semibold text-slate-900 hover:text-cyan-800">{material.fileName}</Link>
                      <p className="mt-1 text-sm text-slate-500">{material.fileType.toUpperCase()} · {formatFileSize(material.fileSize)} · Added {new Date(material.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${material.storedLocally ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{material.storedLocally ? material.status : "File unavailable · re-upload"}</span>
                      <Link href={`/materials/${material.id}`} className="text-sm font-medium text-cyan-800 underline">View / analyze</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
