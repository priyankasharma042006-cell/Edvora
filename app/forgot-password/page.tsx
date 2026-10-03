import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Account recovery</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Password reset unavailable</h1>
        <p className="mt-4 leading-7 text-slate-300">This local prototype does not have an email delivery or password-reset service configured, so it cannot send a reset link. No reset request has been created.</p>
        <Link href="/login" className="mt-6 inline-block rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">Back to login</Link>
      </section>
    </main>
  );
}
