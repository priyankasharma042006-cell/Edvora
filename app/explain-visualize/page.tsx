"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

export default function ExplainVisualizePage() {
  const [question, setQuestion] = useState("Explain deadlock.");
  const [data, setData] = useState<{ answer: string; source: string | null; grounded: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("edvora-token");
    if (!token) return;

    const subjectId = "subject-os";
    const ask = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subjectId, question: "Explain deadlock" }),
        });
        const payload = await response.json();
        if (response.ok) setData(payload);
      } finally {
        setLoading(false);
      }
    };

    ask();
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("edvora-token");
    if (!token) return;

    setLoading(true);
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subjectId: "subject-os", question }),
    });
    const payload = await response.json();
    setData(payload);
    setLoading(false);
  };

  return (
    <DashboardLayout title="Explain & Visualize" subtitle="Material-grounded explanations and diagrams">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Ask a concept</h3>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-4 h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none focus:border-cyan-400" />
          <button onClick={handleSubmit} className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Explain concept</button>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Visualization mode</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Deadlock flow diagram</p>
            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
              Process P1 → holds R1 → waits for R2<br />
              Process P2 → holds R2 → waits for R1<br />
              ↓<br />
              DEADLOCK
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Explanation output</h3>
          {loading ? <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-slate-600">Generating explanation...</div> : null}
          {data ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">{data.answer}</div>
              {data.source ? <p className="text-sm text-slate-500">Source: {data.source}</p> : null}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{data.grounded ? "Grounded in uploaded material." : "Not found in the uploaded material."}</div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-slate-600">Ask a question to see a source-grounded explanation.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
