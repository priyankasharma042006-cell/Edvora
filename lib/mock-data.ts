export const dashboardMetrics = [
  { label: "Overall learning progress", value: "78%", accent: "bg-cyan-500" },
  { label: "Topics completed", value: "42/60", accent: "bg-indigo-500" },
  { label: "Average quiz score", value: "81%", accent: "bg-emerald-500" },
  { label: "Knowledge gaps", value: "6", accent: "bg-amber-500" },
];

export const subjects = [
  {
    id: "operating-systems",
    name: "Operating Systems",
    progress: 76,
    completedTopics: 18,
    totalTopics: 24,
    quizScore: 82,
    weakTopics: ["Deadlock Detection", "File Systems"],
    nextTopic: "Deadlock Prevention",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    id: "python",
    name: "Python",
    progress: 89,
    completedTopics: 22,
    totalTopics: 26,
    quizScore: 91,
    weakTopics: ["Asyncio"],
    nextTopic: "Concurrency Patterns",
    accent: "from-indigo-500 to-violet-600",
  },
  {
    id: "dbms",
    name: "DBMS",
    progress: 68,
    completedTopics: 17,
    totalTopics: 25,
    quizScore: 74,
    weakTopics: ["Normalization", "Transactions"],
    nextTopic: "Indexing Strategies",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "computer-networks",
    name: "Computer Networks",
    progress: 82,
    completedTopics: 20,
    totalTopics: 24,
    quizScore: 85,
    weakTopics: ["TCP Congestion Control"],
    nextTopic: "Routing Algorithms",
    accent: "from-amber-500 to-orange-600",
  },
];

export const studentActivity = [
  { label: "Current topic", value: "Deadlock Detection" },
  { label: "Recommended duration", value: "20 min" },
  { label: "Revision due", value: "Today" },
  { label: "Pending quiz", value: "3 questions" },
  { label: "Next learning activity", value: "Practice resource allocation graphs" },
];

export const smartRecommendation =
  "You have completed CPU Scheduling. Your recent quiz performance indicates that Deadlock Detection needs additional practice. Recommended next activity: 20-minute revision + 5-question quiz.";

export const subjectDetails = {
  "operating-systems": {
    summary: "Process management, memory, synchronization, deadlock, and file systems.",
    documents: [
      { name: "Operating Systems Unit 5.pdf", type: "PDF", status: "Processed", pages: 46 },
      { name: "OS Slides - Deadlock.pptx", type: "PPTX", status: "Processing", pages: 18 },
    ],
    topics: [
      { name: "Deadlock", progress: 92, status: "Strong" },
      { name: "Memory Management", progress: 74, status: "Needs review" },
      { name: "File Systems", progress: 88, status: "On track" },
      { name: "CPU Scheduling", progress: 61, status: "Weak area" },
    ],
  },
};

export const conversations = [
  { id: "c1", title: "Deadlock explanation", updatedAt: "Today, 9:15 AM", subject: "Operating Systems" },
  { id: "c2", title: "Revision notes - memory management", updatedAt: "Yesterday", subject: "Operating Systems" },
  { id: "c3", title: "Exam question review", updatedAt: "Mon", subject: "DBMS" },
];

export const quizDeck = [
  {
    id: "q1",
    topic: "Deadlock Detection",
    difficulty: "Beginner",
    questions: 5,
    timeLimit: "8 min",
  },
  {
    id: "q2",
    topic: "Memory Management",
    difficulty: "Standard",
    questions: 10,
    timeLimit: "12 min",
  },
  {
    id: "q3",
    topic: "File Systems",
    difficulty: "Exam",
    questions: 7,
    timeLimit: "10 min",
  },
];

export const reminderQueue = [
  { title: "Deadlock revision is due today", time: "Today • 6:00 PM", action: "20-minute review" },
  { title: "CPU scheduling quiz pending", time: "Tomorrow • 8:30 AM", action: "Attempt 5-question quiz" },
  { title: "Continue your study session", time: "Wed • 7:00 PM", action: "Finish Unit 3 notes" },
];

export const progressChart = [
  { label: "Deadlock", value: 92 },
  { label: "Memory Management", value: 74 },
  { label: "File Systems", value: 88 },
  { label: "CPU Scheduling", value: 61 },
];

export const learningRecommendations = [
  "Review CPU Scheduling",
  "Study Deadlock Prevention",
  "Practice Deadlock Detection",
  "Take 10-question quiz",
  "Revise weak concepts",
];
