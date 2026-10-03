"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

export default function ChatHistoryPage() {
  const [conversations, setConversations] = useState<Array<{ id: string; title: string; updatedAt: string; subjectId?: string }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("edvora-token");
    if (!token) return;
    fetch("/api/conversations", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => {
        setConversations(data || []);
        if ((data || []).length > 0) setSelectedId(data[0].id);
      });
  }, []);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null;

  return (
    <DashboardLayout title="Chat History" subtitle="Saved conversations and follow-ups">
      <div className="grid gap-4 lg:grid-cols-3">
        {conversations.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-slate-500">No saved conversations yet.</div> : null}
        {conversations.map((conversation) => (
          <div key={conversation.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Operating Systems</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">{conversation.title}</h3>
            <p className="mt-3 text-sm text-slate-500">Updated {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : "Recently"}</p>
            <button onClick={() => setSelectedId(conversation.id)} className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800">
              {selectedId === conversation.id ? "Selected" : "Continue chat"}
            </button>
          </div>
        ))}
      </div>

      {selected ? (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current conversation</p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">{selected.title}</h4>
          <p className="mt-3 text-slate-700">Continue from your previous explanation and follow-up questions to reinforce the concept.</p>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
