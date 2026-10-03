"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-shell";

type Subject = { id: string; name: string };
type Message = { speaker: "You" | "Edvora"; text: string; source?: string };

export default function AiTutorPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("edvora-token") ?? "";
    fetch("/api/subjects", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json() as Subject[] | { error?: string };
        if (!response.ok || !Array.isArray(payload)) throw new Error("Your subjects could not be loaded.");
        setSubjects(payload);
        setSubjectId(payload[0]?.id ?? "");
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Your subjects could not be loaded."))
      .finally(() => setLoadingSubjects(false));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || !subjectId || loading) return;
    const token = localStorage.getItem("edvora-token");
    if (!token) {
      setError("Sign in to use Ask Edvora.");
      return;
    }

    setMessages((current) => [...current, { speaker: "You", text: question }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subjectId, question }),
      });
      const payload = await response.json() as { answer?: string; source?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Edvora could not answer this question.");
      setMessages((current) => [...current, { speaker: "Edvora", text: payload.answer || "", source: payload.source }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Edvora could not answer this question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Ask Edvora" subtitle="Questions grounded in your learning material">
      {error ? <p role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">{error}</p> : null}
      {loadingSubjects ? <div className="rounded-2xl bg-white p-5 text-slate-600">Loading subjects…</div> : null}
      {!loadingSubjects && subjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-7 text-slate-700">
          <h3 className="text-lg font-semibold">Add a subject and a text file to begin</h3>
          <p className="mt-2 text-sm">Ask Edvora currently reads uploaded plain-text (.txt) files only, and requires an OpenAI API key.</p>
          <Link href="/subjects" className="mt-4 inline-block font-medium text-cyan-800 underline">Create a subject</Link>
        </div>
      ) : null}
      {!loadingSubjects && subjects.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Material-grounded conversation</h3>
              <p className="mt-1 text-sm text-slate-600">No response is generated unless a readable text source and AI provider are available.</p>
            </div>
            <label className="w-full max-w-xs text-sm font-medium text-slate-700">
              Subject
              <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex min-h-80 flex-col justify-between">
            <div className="space-y-4">
              {messages.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Ask a question about your uploaded .txt materials. Questions and answers will appear here for this session.</p> : null}
              {messages.map((message, index) => (
                <div key={`${message.speaker}-${index}`} className={`flex ${message.speaker === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 ${message.speaker === "You" ? "bg-cyan-500 text-slate-950" : "bg-slate-100 text-slate-800"}`}>
                    <p className="mb-1 text-xs uppercase tracking-[0.18em] opacity-70">{message.speaker}</p>
                    <p>{message.text}</p>
                    {message.source ? <p className="mt-2 text-xs opacity-70">Source: {message.source}</p> : null}
                  </div>
                </div>
              ))}
              {loading ? <p role="status" className="text-sm text-slate-500">Checking the source and asking the AI provider…</p> : null}
            </div>
            <form onSubmit={handleSubmit} className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input value={input} onChange={(event) => setInput(event.target.value)} type="text" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400" placeholder="Ask about your material…" />
              <button type="submit" disabled={loading || !input.trim()} className="rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 disabled:opacity-60">{loading ? "Asking…" : "Send"}</button>
            </form>
          </div>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
