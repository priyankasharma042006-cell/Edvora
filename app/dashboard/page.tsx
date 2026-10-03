"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout, StatCard } from "@/components/dashboard-shell";
import type { MaterialMetadata } from "@/lib/material-types";

type DashboardData = {
  overallProgress: number;
  topicsCompleted: number;
  averageQuizScore: number;
  knowledgeGaps: number;
  topicsDueForRevision: number;
  totalSubjects: number;
  totalMaterials: number;
  quizAttempts: number;
  subjects: Array<{
    id: string;
    name: string;
    progress: number;
    completedTopics: number;
    totalTopics: number;
    quizScore: number;
    weakTopics: string[];
    nextTopic: string;
  }>;
  recommendations: string[];
  recentMaterials: MaterialMetadata[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("edvora-token") ?? "";

    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json() as DashboardData & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Dashboard data could not be loaded.");
        setData(payload);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Dashboard data could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardLayout title="Dashboard" subtitle="Learning overview"><div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading your dashboard…</div></DashboardLayout>;
  }
  if (error || !data) {
    return <DashboardLayout title="Dashboard" subtitle="Learning overview"><div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">{error || "Dashboard data is unavailable."}</div></DashboardLayout>;
  }

  const metrics = [
    { label: "Subjects", value: String(data.totalSubjects), accent: "bg-cyan-500" },
    { label: "Learning materials", value: String(data.totalMaterials), accent: "bg-indigo-500" },
    { label: "Quiz attempts", value: String(data.quizAttempts), accent: "bg-emerald-500" },
    { label: "Average quiz score", value: data.quizAttempts ? `${data.averageQuizScore}%` : "—", accent: "bg-amber-500" },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Your learning overview">
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-800">Welcome to Edvora</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">Build momentum, one resource at a time.</h3>
        </div>
        <div className="flex gap-2">
          <Link href="/subjects" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800">Add subject</Link>
          <Link href="/materials" className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950">Upload material</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">Your subjects</h3>
            <Link href="/subjects" className="text-sm font-medium text-cyan-800 hover:underline">Manage subjects</Link>
          </div>
          {data.subjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">
              <p>No subjects yet. Create one to start organizing your learning.</p>
              <Link href="/subjects" className="mt-3 inline-block font-medium text-cyan-800 underline">Create a subject</Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.subjects.map((subject) => (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-cyan-300">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-slate-900">{subject.name}</h4>
                    <span className="text-sm text-slate-600">{subject.completedTopics} quiz topics</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${subject.progress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{subject.quizScore ? `Average quiz score: ${subject.quizScore}%` : "No quiz results yet"} · {subject.nextTopic}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">Recently added materials</h3>
            <Link href="/materials" className="text-sm font-medium text-cyan-800 hover:underline">View all</Link>
          </div>
          {data.recentMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">Materials you upload will appear here, organized by subject.</div>
          ) : (
            <ul className="space-y-3">
              {data.recentMaterials.map((material) => (
                <li key={material.id} className="rounded-2xl bg-slate-50 p-4">
                  <Link href={`/materials/${material.id}`} className="break-all font-medium text-slate-900 hover:text-cyan-800">{material.fileName}</Link>
                  <p className="mt-1 text-sm text-slate-500">{data.subjects.find((subject) => subject.id === material.subjectId)?.name ?? "Subject"} · {new Date(material.uploadedAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Learning progress</h3>
          <p className="mt-2 text-sm text-slate-600">{data.quizAttempts ? `${data.topicsCompleted} distinct topics have quiz history. Average score: ${data.averageQuizScore}%.` : "Progress insights will appear after you complete a quiz."}</p>
          <Link href="/progress" className="mt-3 inline-block text-sm font-medium text-cyan-800 underline">View progress</Link>
        </div>
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Next step</h3>
          <p className="mt-2 text-sm text-slate-700">{data.recommendations[0] || "Add a subject and learning materials to get started."}</p>
          <Link href={data.totalMaterials ? "/materials" : "/subjects"} className="mt-3 inline-block text-sm font-medium text-indigo-800 underline">
            {data.totalMaterials ? "Open learning materials" : "Create your first subject"}
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}
