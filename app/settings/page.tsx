"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

type Status = { aiConfigured: boolean; supportedTextExtraction: string[]; storageMode: string; maxUploadBytes: number };

export default function SettingsPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then(async (response) => {
        if (!response.ok) throw new Error("Service configuration could not be loaded.");
        const data = await response.json() as Status;
        if (!cancelled) setStatus(data);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Service configuration could not be loaded.");
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout title="Settings" subtitle="Storage and learning service configuration">
      {error ? <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">AI learning service</h3>
          {!status ? <p className="mt-4 text-sm text-slate-600">Checking configuration…</p> : (
            <>
              <p className={`mt-4 rounded-xl p-3 text-sm ${status.aiConfigured ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                {status.aiConfigured ? "AI provider key is configured." : "AI service is not configured. Set OPENAI_API_KEY in the server environment to enable AI-generated learning content."}
              </p>
              <p className="mt-4 text-sm text-slate-600">Text extraction formats: {status.supportedTextExtraction.join(", ")}</p>
              <p className="mt-1 text-sm text-slate-600">PDF, Office documents, and images can be stored and downloaded but are not currently extracted for AI analysis.</p>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">File storage</h3>
          {!status ? <p className="mt-4 text-sm text-slate-600">Checking storage…</p> : (
            <>
              <p className="mt-4 text-sm text-slate-700">Uploaded files are stored in the local project’s <code>data/uploads</code> folder.</p>
              <p className="mt-2 text-sm text-slate-600">Maximum file size: {(status.maxUploadBytes / (1024 * 1024)).toFixed(0)} MB. This is local development storage, not cloud backup.</p>
              <p className="mt-2 text-sm text-slate-600">Current mode: {status.storageMode}.</p>
            </>
          )}
          <Link href="/materials" className="mt-5 inline-block rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Manage materials</Link>
        </section>
      </div>
    </DashboardLayout>
  );
}
