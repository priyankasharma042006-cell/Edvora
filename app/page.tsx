import Link from "next/link";

const featureCards = [
  {
    title: "Material-grounded AI tutoring",
    text: "Ask questions grounded in uploaded plain-text study resources when an AI provider is configured.",
  },
  {
    title: "Your learning dashboard",
    text: "See your own subjects, uploaded resources, and quiz history in one workspace.",
  },
  {
    title: "Optional AI study tools",
    text: "Connect an AI provider to generate source-based summaries, notes, quizzes, flashcards, and answers from text materials.",
  },
];

const stats = [
  { label: "Your study space", value: "Personal" },
  { label: "Materials", value: "By subject" },
  { label: "AI features", value: "Optional" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 font-bold text-lg text-white">
              E
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI learning</p>
              <h1 className="text-2xl font-semibold">Edvora</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features">Features</a>
            <a href="#features">How it works</a>
            <Link href="/login" className="rounded-full border border-slate-700 px-4 py-2 text-white hover:border-slate-500">
              Login
            </Link>
            <Link href="/signup" className="rounded-full bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400">
              Get started
            </Link>
          </nav>
        </header>

        <section className="grid items-center gap-10 pb-14 pt-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">
              Learn smarter. Understand deeper.
            </p>
            <h2 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">
              Your personal learning intelligence system.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Organize notes, PDFs, slides, and course materials by subject. When configured, AI study tools can work from uploaded plain-text resources.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-slate-950 hover:bg-cyan-400">
                Start learning
              </Link>
              <Link href="/dashboard" className="rounded-full border border-slate-700 px-6 py-3 font-medium text-white hover:border-slate-400">
                Explore dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl shadow-cyan-500/10">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                <span>Operating Systems</span>
                <span>Illustrative preview</span>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-800 p-3 text-sm text-slate-200">
                  <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">Example study note</p>
                  A deadlock occurs when each process is waiting for a resource held by another process, forming a circular wait condition.
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-3 text-sm text-cyan-100">
                  <p className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-200">Visualization</p>
                  P1 → holds R1 → waits for R2; P2 → holds R2 → waits for R1
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  <p className="mb-2 text-xs uppercase tracking-[0.24em] text-emerald-200">Recommended next step</p>
                  20-minute revision + 5-question quiz on deadlock detection.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Why Edvora</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">Built for real learning, not generic AI answers.</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="mb-4 h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500/40 to-indigo-500/40" />
                <h4 className="text-xl font-semibold text-white">{card.title}</h4>
                <p className="mt-3 text-slate-300">{card.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
