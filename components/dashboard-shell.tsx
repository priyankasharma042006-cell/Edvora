import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Subjects", href: "/subjects" },
  { label: "Study Materials", href: "/materials" },
  { label: "Ask Edvora", href: "/ai-tutor" },
  { label: "Quizzes", href: "/quizzes" },
  { label: "Progress", href: "/progress" },
  { label: "Search", href: "/search" },
  { label: "Settings", href: "/settings" },
];

export function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950 p-5 text-slate-100 lg:flex">
          <Link href="/dashboard" className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 font-semibold text-white">E</div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">AI learning</p>
              <span className="text-2xl font-semibold">Edvora</span>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Study workspace</p>
            <p className="mt-2 text-lg font-semibold text-white">Your learning, organized</p>
            <p className="mt-1 text-sm text-cyan-100">Choose a subject to get started.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <Link href="/dashboard" aria-label="Edvora dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white lg:hidden">E</Link>
              <Link href="/search" className="hidden w-full max-w-md rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 transition hover:border-cyan-400 md:block">
                Search subjects and materials…
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <Link href="/subjects" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">Add subject</Link>
                <Link href="/profile" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-semibold text-white">E</span>
                  <span className="hidden text-sm font-medium text-slate-800 sm:inline">My account</span>
                </Link>
              </div>
            </div>
            <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-slate-200 px-3 py-2 lg:hidden">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">{item.label}</Link>
              ))}
            </nav>
          </header>

          <main className="p-4 sm:p-6">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Learning workspace</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 h-2 w-14 rounded-full ${accent}`} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}
