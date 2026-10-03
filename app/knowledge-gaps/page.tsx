"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

export default function KnowledgeGapsPage() {
  const [gaps, setGaps] = useState<Array<{ id: string; topic: string; reason: string; severity: string }>>([]);
  const [selected, setSelected] = useState<{ id: string; topic: string; reason: string; severity: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("edvora-token");
    if (!token) return;
    fetch("/api/knowledge-gaps", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => {
        setGaps(data || []);
        if ((data || []).length > 0) setSelected(data[0]);
      });
  }, []);

  return (
    <DashboardLayout title="Knowledge Gaps" subtitle="Supportive guidance and next actions">
      <div className="grid gap-5 lg:grid-cols-3">
        {gaps.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-slate-500">No knowledge gaps detected yet.</div> : null}
        {gaps.map((gap) => (
          <div key={gap.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{gap.severity}</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">{gap.topic}</h3>
            <p className="mt-3 text-slate-600">{gap.reason}</p>
            <button onClick={() => setSelected(gap)} className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 font-medium text-white hover:bg-amber-400">
              {selected?.id === gap.id ? "Selected" : "Review recommendation"}
            </button>
          </div>
        ))}
      </div>

      {selected ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-slate-800">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Recommendation</p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">{selected.topic}</h4>
          <p className="mt-3 text-slate-700">{selected.reason}</p>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
