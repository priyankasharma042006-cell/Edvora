"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

const revisionTopics = [
  { title: "Deadlock prevention", reason: "Low confidence after last quiz", due: "Due today", detail: "Revisit the necessary and sufficient conditions for deadlock and compare prevention vs. avoidance in a short recap session." },
  { title: "Resource allocation graphs", reason: "Repeated mistakes in visual questions", due: "Due tomorrow", detail: "Practice recognizing cycle patterns, edge interpretation, and the difference between request and assignment edges." },
  { title: "CPU scheduling algorithms", reason: "Needs comparison practice", due: "Due in 2 days", detail: "Compare FIFO, SJF, Round Robin, and priority scheduling using turnaround time and waiting time examples." },
];

export default function RevisionPage() {
  const [selected, setSelected] = useState(revisionTopics[0]);

  return (
    <DashboardLayout title="Revision" subtitle="Smart review based on performance">
      <div className="grid gap-5 lg:grid-cols-3">
        {revisionTopics.map((topic) => (
          <div key={topic.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{topic.due}</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">{topic.title}</h3>
            <p className="mt-3 text-slate-600">{topic.reason}</p>
            <button onClick={() => setSelected(topic)} className="mt-5 w-full rounded-xl bg-indigo-500 px-4 py-3 font-medium text-white hover:bg-indigo-400">
              {selected.title === topic.title ? "Selected" : "Review topic"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-slate-800">
        <p className="text-xs uppercase tracking-[0.18em] text-indigo-700">Current focus</p>
        <h4 className="mt-2 text-xl font-semibold text-slate-900">{selected.title}</h4>
        <p className="mt-3 text-slate-700">{selected.detail}</p>
      </div>
    </DashboardLayout>
  );
}
