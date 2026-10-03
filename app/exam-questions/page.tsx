"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

const questionSet = [
  { type: "1 Mark", title: "Define deadlock.", detail: "A deadlock occurs when two or more processes are each waiting for resources held by the others, resulting in a circular wait that prevents progress." },
  { type: "2/3 Mark", title: "Explain circular wait with a suitable example.", detail: "In a circular wait, Process P1 holds Resource R1 and waits for R2, while Process P2 holds R2 and waits for R1. This forms a deadlock cycle." },
  { type: "4/5 Mark", title: "Compare deadlock prevention and deadlock avoidance strategies.", detail: "Prevention prevents the occurrence of one or more conditions, while avoidance uses resource-allocation decisions to prevent unsafe states." },
  { type: "7/10 Mark", title: "Describe how resource allocation graphs help identify deadlock situations.", detail: "Resource allocation graphs show process-resource edges; a cycle in the graph indicates a deadlock may exist, while the absence of a cycle suggests no deadlock." },
];

export default function ExamQuestionsPage() {
  const [selected, setSelected] = useState(questionSet[0]);

  return (
    <DashboardLayout title="Exam Questions" subtitle="Potential examination prompts">
      <div className="grid gap-5 lg:grid-cols-2">
        {questionSet.map((question) => (
          <div key={question.type} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{question.type}</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{question.title}</h3>
            <button onClick={() => setSelected(question)} className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100">
              View prompt
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-slate-800">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-700">Selected prompt</p>
        <h4 className="mt-2 text-xl font-semibold text-slate-900">{selected.title}</h4>
        <p className="mt-3 text-slate-700">{selected.detail}</p>
      </div>
    </DashboardLayout>
  );
}
