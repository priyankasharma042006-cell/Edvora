"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed.");

      localStorage.setItem("edvora-token", data.token);
      localStorage.setItem("edvora-user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Signup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-indigo-500/10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 font-bold text-lg text-white">E</div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Create account</p>
            <h1 className="text-2xl font-semibold text-white">Start with Edvora</h1>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Full name</label>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} type="text" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="Aditi Sharma" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="aditi@college.edu" required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="••••••••" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Confirm</label>
              <input value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="••••••••" required />
            </div>
          </div>

          {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <button type="submit" disabled={isLoading} className="block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-center font-semibold text-slate-950 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="font-medium text-cyan-300">Log in</Link>
        </p>
      </div>
    </main>
  );
}
