"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";
import type { MaterialMetadata } from "@/lib/material-types";

type Attempt = { id: string; subjectId: string; topic: string; score: number; total: number; accuracy: number; createdAt: string };
type Subject = { id: string; name: string };

export default function QuizzesPage() {
  const [materials, setMaterials] = useState<MaterialMetadata[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("edvora-token") ?? "";
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/materials", { headers }),
      fetch("/api/quizzes", { headers }),
      fetch("/api/subjects", { headers }),
    ])
      .then(async ([materialsResponse, attemptsResponse, subjectsResponse]) => {
        if (!materialsResponse.ok || !attemptsResponse.ok || !subjectsResponse.ok) {
          throw new Error("Quiz data could not be loaded.");
        }
        const [materialData, attemptData, subjectData] = await Promise.all([
          materialsResponse.json() as Promise<MaterialMetadata[]>,
          attemptsResponse.json() as Promise<{ attempts: Attempt[] }>,
          subjectsResponse.json() as Promise<Subject[]>,
        ]);
        if (cancelled) return;
        setMaterials(materialData);
        setAttempts(attemptData.attempts);
        setSubjects(subjectData);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Quiz data could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout title="Quizzes" subtitle="Practice generated from your own materials">
      <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
        <h3 className="text-lg font-semibold text-slate-900">Source-grounded quizzes</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">Open one of your materials and choose the Quiz tab. Quiz generation requires a plain-text file and an AI provider configured with OPENAI_API_KEY. Edvora does not substitute generic questions when either is unavailable.</p>
      </section>

      {error ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p> : null}
      {loading ? <p className="mt-5 rounded-xl bg-white p-5 text-slate-600">Loading materials and quiz history…</p> : null}

      {!loading ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Quiz-ready materials</h3>
          {materials.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-5 text-slate-600">
              <p>Upload a .txt learning material to create a source-based quiz.</p>
              <Link href="/materials" className="mt-3 inline-block font-medium text-cyan-800 underline">Go to materials</Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {materials.map((material) => (
                <li key={material.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="break-all font-medium text-slate-900">{material.fileName}</p>
                    <p className="mt-1 text-sm text-slate-500">{subjects.find((subject) => subject.id === material.subjectId)?.name ?? "Subject"} · {material.fileType.toUpperCase()}</p>
                  </div>
                  <Link href={`/materials/${material.id}?tab=Quiz`} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Open quiz tools</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!loading ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Quiz history</h3>
          {attempts.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-600">Completed quiz results will appear here.</p> : (
            <ul className="mt-4 divide-y divide-slate-100">
              {attempts.map((attempt) => (
                <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{attempt.topic}</p>
                    <p className="text-sm text-slate-500">{subjects.find((subject) => subject.id === attempt.subjectId)?.name ?? "Archived subject"} · {new Date(attempt.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-slate-800">{attempt.score}/{attempt.total} ({attempt.accuracy}%)</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </DashboardLayout>
  );
}
