"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";
import { reminderQueue } from "@/lib/mock-data";

export default function RemindersPage() {
  const [selected, setSelected] = useState(reminderQueue[0]);

  return (
    <DashboardLayout title="Reminders" subtitle="Context-aware study nudges">
      <div className="grid gap-5 lg:grid-cols-3">
        {reminderQueue.map((reminder) => (
          <div key={reminder.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{reminder.time}</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{reminder.title}</h3>
            <p className="mt-3 text-slate-600">{reminder.action}</p>
            <button onClick={() => setSelected(reminder)} className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100">
              {selected.title === reminder.title ? "Selected" : "Manage reminder"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected reminder</p>
        <h4 className="mt-2 text-xl font-semibold text-slate-900">{selected.title}</h4>
        <p className="mt-3 text-slate-700">{selected.action}</p>
      </div>
    </DashboardLayout>
  );
}
