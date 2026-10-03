"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

export default function SearchPage() {
  const [query, setQuery] = useState("deadlock");
  const [results, setResults] = useState<Array<{ type: string; title: string; meta: string; href: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const token = localStorage.getItem("edvora-token");
    if (!token) {
      setError("Sign in to search your learning data.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json() as { results?: Array<{ type: string; title: string; meta: string; href: string }>; error?: string };
      if (!response.ok) throw new Error(payload.error || "Search could not be completed.");
      setResults(payload.results || []);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Search could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Search" subtitle="Global search across learning data">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-cyan-400" />
          <button onClick={() => void handleSearch()} disabled={loading} className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Searching…" : "Search"}</button>
        </div>

        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <div className="mt-6 space-y-3">
          {!loading && !error && results.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-500">{query ? "No matches found. Try a different subject or material name." : "Enter a search term to find subjects and materials."}</div> : null}
          {results.map((result) => (
            <Link href={result.href} key={`${result.type}-${result.title}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-cyan-300">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{result.type}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{result.title}</p>
              <p className="mt-1 text-sm text-slate-600">{result.meta}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
