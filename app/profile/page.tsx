"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";

type Profile = { name: string; email: string };
type Snapshot = { totalSubjects: number; totalMaterials: number; quizAttempts: number; averageQuizScore: number };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const storedUser = localStorage.getItem("edvora-user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as Profile;
        Promise.resolve().then(() => {
          if (!cancelled) setProfile(user);
        });
      } catch {
        Promise.resolve().then(() => {
          if (!cancelled) setProfile(null);
        });
      }
    }
    const token = localStorage.getItem("edvora-token") ?? "";
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<Snapshot>;
      })
      .then((data) => {
        if (!cancelled && data) setSnapshot(data);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Your learning snapshot could not be loaded.");
      });
    return () => { cancelled = true; };
  }, []);

  const signOut = () => {
    const token = localStorage.getItem("edvora-token");
    void fetch("/api/auth/session", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    }).finally(() => {
      localStorage.removeItem("edvora-token");
      localStorage.removeItem("edvora-user");
      router.replace("/login");
    });
  };

  return (
    <DashboardLayout title="Profile" subtitle="Your Edvora account">
      {error ? <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p> : null}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xl font-semibold text-white">{profile?.name?.slice(0, 1).toUpperCase() ?? "E"}</div>
            <div className="min-w-0">
              <h3 className="break-words text-2xl font-semibold text-slate-900">{profile?.name || "Edvora learner"}</h3>
              <p className="break-words text-slate-500">{profile?.email || "Sign in to view account details"}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {!profile ? <Link href="/login" className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950">Sign in</Link> : null}
            {profile ? <button type="button" onClick={signOut} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Sign out</button> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Learning snapshot</h3>
          {!snapshot ? <p className="mt-4 text-sm text-slate-600">Sign in to see your activity.</p> : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Subjects", snapshot.totalSubjects],
                ["Materials", snapshot.totalMaterials],
                ["Quiz attempts", snapshot.quizAttempts],
                ["Average score", snapshot.quizAttempts ? `${snapshot.averageQuizScore}%` : "No quiz data"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
