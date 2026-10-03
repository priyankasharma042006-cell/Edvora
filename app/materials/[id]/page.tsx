"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-shell";
import { formatFileSize } from "@/lib/format-file-size";
import type { MaterialMetadata } from "@/lib/material-types";

type Tab = "Overview" | "Summary" | "Notes" | "Quiz" | "Flashcards" | "Ask Edvora";
type QuizQuestion = { question: string; options: string[]; answer: string; explanation: string };
type Flashcard = { question: string; answer: string };

const tabs: Tab[] = ["Overview", "Summary", "Notes", "Quiz", "Flashcards", "Ask Edvora"];

function parseQuizQuestions(content: string): QuizQuestion[] {
  const parsed = JSON.parse(content) as { questions?: unknown };
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("The AI response did not contain a usable quiz. Please try again.");
  }
  const questions = parsed.questions.filter((item): item is QuizQuestion => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.question === "string" &&
      Array.isArray(candidate.options) &&
      candidate.options.length >= 2 &&
      candidate.options.every((option) => typeof option === "string") &&
      typeof candidate.answer === "string" &&
      candidate.options.includes(candidate.answer) &&
      typeof candidate.explanation === "string";
  });
  if (questions.length !== parsed.questions.length) {
    throw new Error("The AI returned an incomplete quiz question. Please try generating it again.");
  }
  return questions;
}

function parseFlashcards(content: string): Flashcard[] {
  const parsed = JSON.parse(content) as { flashcards?: unknown };
  if (!Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
    throw new Error("The AI response did not contain usable flashcards. Please try again.");
  }
  const cards = parsed.flashcards.filter((item): item is Flashcard => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.question === "string" && typeof candidate.answer === "string";
  });
  if (cards.length !== parsed.flashcards.length) {
    throw new Error("The AI returned an incomplete flashcard. Please try generating them again.");
  }
  return cards;
}

export default function MaterialDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [material, setMaterial] = useState<MaterialMetadata | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>(searchParams.get("tab") === "Quiz" ? "Quiz" : "Overview");
  const [outputs, setOutputs] = useState<Partial<Record<Tab, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoices, setQuizChoices] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSaving, setQuizSaving] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("edvora-token") ?? "";
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`/api/materials/${encodeURIComponent(id)}`, { headers }),
      fetch("/api/subjects", { headers }),
    ])
      .then(async ([materialResponse, subjectsResponse]) => {
      const materialPayload = await materialResponse.json() as MaterialMetadata & { error?: string };
      if (!materialResponse.ok) throw new Error(materialPayload.error || "Material not found.");
      if (cancelled) return;
      setMaterial(materialPayload);

      if (subjectsResponse.ok) {
        const subjects = await subjectsResponse.json() as Array<{ id: string; name: string }>;
        setSubjectName(subjects.find((subject) => subject.id === materialPayload.subjectId)?.name ?? "Archived subject");
      }
      setError("");
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Material could not be loaded.");
      });
    return () => { cancelled = true; };
  }, [id]);

  const runAnalysis = async (tab: Exclude<Tab, "Overview" | "Ask Edvora">, task: "summary" | "notes" | "quiz" | "flashcards") => {
    if (!material) return;
    const token = localStorage.getItem("edvora-token");
    if (!token) return setError("Sign in to analyze this material.");

    setActiveTab(tab);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(material.id)}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const payload = await response.json() as { content?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Analysis could not be completed.");
      const content = payload.content ?? "";
      setOutputs((current) => ({ ...current, [tab]: content }));
      if (task === "quiz") {
        const generated = parseQuizQuestions(content);
        setQuizQuestions(generated);
        setQuizIndex(0);
        setQuizChoices({});
        setQuizSubmitted(false);
        setQuizScore(null);
      }
      if (task === "flashcards") {
        setFlashcards(parseFlashcards(content));
        setFlashcardIndex(0);
        setFlipped(false);
      }
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!material || !question.trim()) return;
    const token = localStorage.getItem("edvora-token");
    if (!token) return setError("Sign in to ask a question.");
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(material.id)}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ task: "ask", question: question.trim() }),
      });
      const payload = await response.json() as { content?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Edvora could not answer.");
      setAnswer(payload.content ?? "");
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "Edvora could not answer.");
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    if (!material) return;
    const token = localStorage.getItem("edvora-token");
    if (!token) return setError("Sign in to download this file.");
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(material.id)}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "Download failed.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = material.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Download failed.");
    }
  };

  const submitQuiz = async () => {
    if (!material || !quizQuestions.length || Object.keys(quizChoices).length !== quizQuestions.length) return;
    const score = quizQuestions.reduce((total, item, index) => total + (item.answer === quizChoices[index] ? 1 : 0), 0);
    setQuizSubmitted(true);
    setQuizScore(score);
    setQuizSaving(true);
    const token = localStorage.getItem("edvora-token");
    try {
      const response = await fetch(`/api/materials/${encodeURIComponent(material.id)}/quiz-attempt`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
        body: JSON.stringify({ score, total: quizQuestions.length }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "The score could not be saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? `Score calculated but not saved: ${saveError.message}` : "Score calculated but not saved.");
    } finally {
      setQuizSaving(false);
    }
  };

  return (
    <DashboardLayout title={material?.fileName ?? "Material details"} subtitle="Material workspace">
      {error ? <p role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">{error}</p> : null}
      {!material ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          {error ? "This material is unavailable." : "Loading material…"}
          <Link href="/materials" className="ml-2 font-medium text-cyan-800 underline">Back to materials</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <Link href={`/subjects/${material.subjectId}`} className="text-sm font-medium text-cyan-800 hover:underline">{subjectName}</Link>
              <h3 className="mt-2 break-all text-2xl font-semibold text-slate-900">{material.fileName}</h3>
              <p className="mt-2 text-sm text-slate-500">{material.fileType.toUpperCase()} · {formatFileSize(material.fileSize)} · Added {new Date(material.uploadedAt).toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-600">{material.storedLocally ? "File is stored in the local project." : "This older record has no associated file; upload it again to enable viewing and analysis."} Analysis supports plain-text files when configured. Requested AI processing sends the text to the configured provider.</p>
            </div>
            <button type="button" onClick={() => void download()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Download file</button>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div role="tablist" aria-label="Material features" className="flex gap-1 overflow-x-auto border-b border-slate-200 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => { setActiveTab(tab); setError(""); }}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium ${activeTab === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="min-h-64 p-6">
              {activeTab === "Overview" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Subject", subjectName],
                    ["File type", material.fileType.toUpperCase()],
                    ["File size", formatFileSize(material.fileSize)],
                    ["Storage", material.storedLocally ? "Local project storage" : "File unavailable; upload it again"],
                    ["Analysis status", material.status === "stored" ? "Stored; not yet analyzed" : material.status],
                    ["Text extraction", material.fileType === "txt" ? "Supported" : "Not available for this format"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{label}</p>
                      <p className="mt-2 font-medium text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "Summary" || activeTab === "Notes" ? (
                <div>
                  <button type="button" onClick={() => void runAnalysis(activeTab, activeTab === "Summary" ? "summary" : "notes")} disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-60">
                    {loading ? "Generating…" : activeTab === "Summary" ? "Generate AI summary" : "Generate AI notes"}
                  </button>
                  <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{outputs[activeTab] ?? "No generated content yet. This feature requires a readable .txt file and a configured OPENAI_API_KEY."}</p>
                </div>
              ) : null}

              {activeTab === "Quiz" ? (
                <div>
                  {quizQuestions.length === 0 ? (
                    <div>
                      <p className="mb-4 text-slate-600">Generate a quiz from this file. Requires a readable .txt file and configured AI provider.</p>
                      <button type="button" onClick={() => void runAnalysis("Quiz", "quiz")} disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Generating quiz…" : "Generate quiz"}</button>
                    </div>
                  ) : (
                    <div className="max-w-3xl">
                      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                        <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
                        {quizScore !== null ? <span className="font-semibold text-slate-900">Score: {quizScore}/{quizQuestions.length}</span> : null}
                      </div>
                      <h4 className="text-xl font-semibold text-slate-900">{quizQuestions[quizIndex]?.question}</h4>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {quizQuestions[quizIndex]?.options.map((option) => (
                          <button key={option} type="button" disabled={quizSubmitted} onClick={() => { setQuizChoices((current) => ({ ...current, [quizIndex]: option })); setQuizScore(null); }} className={`rounded-xl border p-3 text-left disabled:cursor-default ${quizChoices[quizIndex] === option ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white"}`}>{option}</button>
                        ))}
                      </div>
                      {quizSubmitted ? <p className={`mt-4 rounded-xl p-3 ${quizChoices[quizIndex] === quizQuestions[quizIndex]?.answer ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{quizChoices[quizIndex] === quizQuestions[quizIndex]?.answer ? "Correct. " : "Not quite. "}{quizQuestions[quizIndex]?.explanation}</p> : null}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button type="button" disabled={quizIndex === 0} onClick={() => setQuizIndex((index) => index - 1)} className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={quizIndex === quizQuestions.length - 1} onClick={() => setQuizIndex((index) => index + 1)} className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-50">Next</button>
                        <button type="button" onClick={() => void submitQuiz()} disabled={quizSubmitted || quizSaving || Object.keys(quizChoices).length !== quizQuestions.length} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{quizSaving ? "Saving…" : "Submit quiz"}</button>
                        <button type="button" onClick={() => { setQuizIndex(0); setQuizScore(null); setQuizChoices({}); setQuizSubmitted(false); }} className="rounded-lg border border-slate-200 px-4 py-2">Restart</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "Flashcards" ? (
                <div>
                  {flashcards.length === 0 ? (
                    <div>
                      <p className="mb-4 text-slate-600">Generate a flashcard deck from this file. Requires a readable .txt file and configured AI provider.</p>
                      <button type="button" onClick={() => void runAnalysis("Flashcards", "flashcards")} disabled={loading} className="rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Generating…" : "Generate flashcards"}</button>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-xl text-center">
                      <p className="mb-3 text-sm text-slate-500">Card {flashcardIndex + 1} of {flashcards.length}</p>
                      <button type="button" onClick={() => setFlipped((current) => !current)} className="flex min-h-56 w-full items-center justify-center rounded-3xl border border-cyan-200 bg-cyan-50 p-8 text-xl font-medium text-slate-900 shadow-sm">
                        {flipped ? flashcards[flashcardIndex]?.answer : flashcards[flashcardIndex]?.question}
                      </button>
                      <p className="mt-2 text-xs text-slate-500">Select the card to flip it.</p>
                      <div className="mt-5 flex justify-center gap-3">
                        <button type="button" disabled={flashcardIndex === 0} onClick={() => { setFlashcardIndex((index) => index - 1); setFlipped(false); }} className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-50">Previous</button>
                        <button type="button" disabled={flashcardIndex === flashcards.length - 1} onClick={() => { setFlashcardIndex((index) => index + 1); setFlipped(false); }} className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "Ask Edvora" ? (
                <div className="max-w-3xl">
                  <p className="mb-4 text-sm text-slate-600">Ask questions grounded in this uploaded text. Other formats are not extractable yet.</p>
                  <label className="block">
                    <span className="sr-only">Question for Edvora</span>
                    <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} placeholder="Ask something about this material…" className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-cyan-400" />
                  </label>
                  <button type="button" onClick={() => void askQuestion()} disabled={loading || !question.trim()} className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white disabled:opacity-60">{loading ? "Asking…" : "Ask Edvora"}</button>
                  {answer ? <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 leading-7 text-slate-800">{answer}</div> : null}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
