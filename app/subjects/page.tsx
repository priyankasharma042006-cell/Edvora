"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

type Subject = { id: string; name: string; description?: string; materialCount: number };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("edvora-token") ?? "";
    fetch("/api/subjects", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json() as Subject[] | { error?: string };
        if (!response.ok || !Array.isArray(payload)) {
          throw new Error("error" in payload ? payload.error || "Subjects could not be loaded." : "Subjects could not be loaded.");
        }
        setSubjects(payload);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Subjects could not be loaded.");
      })
      .finally(() => setLoadingSubjects(false));
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Enter a subject name.");
      return;
    }
    if (cleanName.length > 80) {
      setError("Subject names must be 80 characters or fewer.");
      return;
    }
    const token = localStorage.getItem("edvora-token");
    if (!token) {
      setError("Sign in to create a subject.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: cleanName, description: description.trim() }),
      });
      const payload = await response.json() as Subject & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Subject could not be created.");
      setSubjects((current) => [payload, ...current]);
      setName("");
      setDescription("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Subject could not be created.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Subjects" subtitle="Organize your learning materials">
      <form onSubmit={handleCreate} className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Create a subject</h3>
        <p className="mt-1 text-sm text-slate-600">Choose any subject name that works for your studies.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Subject name (e.g. Machine Learning)" required className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none focus:border-cyan-400" />
          <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Description (optional)" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none focus:border-cyan-400" />
          <button type="submit" disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Saving…" : "Add subject"}</button>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      </form>

      {loadingSubjects ? <div className="rounded-2xl bg-white p-5 text-slate-600">Loading subjects…</div> : null}
      {!loadingSubjects && subjects.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">No subjects yet. Add your first subject to start building your study space.</div> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
            <h3 className="text-2xl font-semibold text-slate-900">{subject.name}</h3>
            <p className="mt-3 text-sm text-slate-600">{subject.description || "Add a description when you want to keep extra context for this subject."}</p>
            <p className="mt-4 text-sm font-medium text-slate-700">{subject.materialCount} material{subject.materialCount === 1 ? "" : "s"}</p>
            <span className="mt-4 inline-block text-sm font-medium text-cyan-800">Open subject →</span>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
