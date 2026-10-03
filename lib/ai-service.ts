export type LearningTask = "summary" | "notes" | "quiz" | "flashcards" | "ask";

const taskInstructions: Record<LearningTask, string> = {
  summary: "Create a concise, accurate summary of the source.",
  notes: "Create structured study notes with headings and concise bullet points.",
  quiz: "Return exactly 5 multiple-choice questions as JSON: {\"questions\":[{\"question\":string,\"options\":string[4],\"answer\":string,\"explanation\":string}]}. The answer must exactly match one option.",
  flashcards: "Return 8 useful study flashcards as JSON: {\"flashcards\":[{\"question\":string,\"answer\":string}]}.",
  ask: "Answer the student's question using only the source. Say when the source does not contain enough information.",
};

export async function generateLearningContent(task: LearningTask, source: string, question?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("AI service is not configured. Set OPENAI_API_KEY to enable AI learning features.");
  }
  if (source.length > 80_000) {
    throw new Error("This text file is larger than the current AI processing limit of 80,000 characters.");
  }

  const prompt = [
    taskInstructions[task],
    task === "ask" && question ? `Student question: ${question}` : "",
    "Use only the provided source and do not invent source citations.",
    `Source:\n${source}`,
  ].filter(Boolean).join("\n\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Edvora, a careful study assistant that grounds all outputs in the supplied learning material." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: task === "quiz" || task === "flashcards" ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed (${response.status}).`);
  }

  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned an empty response.");
  return content;
}
