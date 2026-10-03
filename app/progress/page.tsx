"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

type ProgressData = {
  subjects: Array<{ id: string; name: string; progress: number; completedTopics: number; quizScore: number }>;
  topicsCompleted: number;
  averageQuizScore: number;
  quizAttempts: number;
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("edvora-token") ?? "";
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json() as ProgressData & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Progress data could not be loaded.");
        setData(payload);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Progress data could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Progress" subtitle="Analytics from your study activity">
      {loading ? <div className="rounded-2xl bg-white p-6 text-slate-600">Loading progress…</div> : null}
      {error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p> : null}
      {!loading && !error && data ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Subjects", data.subjects.length],
              ["Quiz attempts", data.quizAttempts],
              ["Distinct topics quizzed", data.topicsCompleted],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Quiz performance by subject</h3>
            {data.quizAttempts === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">
                <p>There is not enough quiz history to show performance yet. Your results will appear here after your first quiz.</p>
                <Link href="/quizzes" className="mt-3 inline-block font-medium text-cyan-800 underline">Browse practice quizzes</Link>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {data.subjects.filter((subject) => subject.quizScore > 0).map((subject) => (
                  <div key={subject.id}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <Link href={`/subjects/${subject.id}`} className="font-medium text-slate-800 hover:text-cyan-800">{subject.name}</Link>
                      <span className="text-slate-600">{subject.quizScore}% average · {subject.completedTopics} topics</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${subject.quizScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </DashboardLayout>
  );
}
