import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "fs";
import path from "path";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type Subject = {
  id: string;
  userId: string;
  name: string;
  description: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
};

export type Material = {
  id: string;
  userId: string;
  subjectId: string;
  fileName: string;
  fileType: string;
  mimeType?: string;
  fileSize: number;
  uploadedAt: string;
  status: "processed" | "queued" | "failed" | "stored";
  pages: number;
  topics: string[];
  source: string;
  storageKey?: string;
  error?: string;
};

export type Conversation = {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { role: "user" | "assistant"; content: string; createdAt: string }[];
};

export type QuizAttempt = {
  id: string;
  userId: string;
  subjectId: string;
  topic: string;
  score: number;
  total: number;
  accuracy: number;
  createdAt: string;
};

export type KnowledgeGap = {
  id: string;
  userId: string;
  subjectId: string;
  topic: string;
  severity: "low" | "medium" | "high";
  reason: string;
  detectedAt: string;
};

export type Session = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type AppData = {
  users: User[];
  sessions: Session[];
  subjects: Subject[];
  materials: Material[];
  conversations: Conversation[];
  quizAttempts: QuizAttempt[];
  knowledgeGaps: KnowledgeGap[];
};

export function serializeMaterial(material: Material): Omit<Material, "storageKey"> & { storedLocally: boolean } {
  const publicMaterial = { ...material };
  delete publicMaterial.storageKey;
  return { ...publicMaterial, storedLocally: Boolean(material.storageKey) };
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "edvora.json");

function defaultData(): AppData {
  return {
    users: [],
    sessions: [],
    subjects: [],
    materials: [],
    conversations: [],
    quizAttempts: [],
    knowledgeGaps: [],
  };
}

export function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData(), null, 2), "utf8");
  }
}

export function readData(): AppData {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as AppData;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      subjects: parsed.subjects ?? [],
      materials: parsed.materials ?? [],
      conversations: parsed.conversations ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
      knowledgeGaps: parsed.knowledgeGaps ?? [],
    };
  } catch (error) {
    throw new Error(`Edvora data file could not be read. The existing file was preserved at ${DATA_FILE}.`, { cause: error });
  }
}

export function writeData(data: AppData) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function legacyPasswordHash(password: string) {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    const chr = password.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `sha256:${hash.toString(16)}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return storedHash === legacyPasswordHash(password);
  }

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function getUserByToken(token: string) {
  const store = readData();
  const session = store.sessions.find((item) => item.token === token && Date.parse(item.expiresAt) > Date.now());
  return session ? store.users.find((user) => user.id === session.userId) : undefined;
}

export function createSession(data: AppData, userId: string) {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  data.sessions.push({
    token,
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  return token;
}

export function deleteSession(token: string) {
  const data = readData();
  const remaining = data.sessions.filter((session) => session.token !== token);
  if (remaining.length !== data.sessions.length) {
    data.sessions = remaining;
    writeData(data);
  }
}

export function getUserFromHeader(header?: string | null) {
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.replace("Bearer ", "").trim();
  if (!token) return null;
  return getUserByToken(token);
}

export function getDashboardState(userId: string) {
  const data = readData();
  const subjects = data.subjects.filter((subject) => subject.userId === userId && !subject.archived);
  const attempts = data.quizAttempts.filter((attempt) => attempt.userId === userId);
  const materials = data.materials.filter((material) => material.userId === userId);
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((total, attempt) => total + attempt.accuracy, 0) / attempts.length)
    : 0;

  const subjectCards = subjects.map((subject) => {
    const subjectAttempts = attempts.filter((attempt) => attempt.subjectId === subject.id);
    const score = subjectAttempts.length
      ? Math.round(subjectAttempts.reduce((total, attempt) => total + attempt.accuracy, 0) / subjectAttempts.length)
      : 0;
    const completedTopics = new Set(subjectAttempts.map((attempt) => attempt.topic)).size;
    return {
      id: subject.id,
      name: subject.name,
      progress: score,
      completedTopics,
      totalTopics: completedTopics,
      quizScore: score,
      weakTopics: [],
      nextTopic: materials.some((material) => material.subjectId === subject.id)
        ? "Continue studying your materials"
        : "Upload your first learning material",
    };
  });

  return {
    overallProgress: averageScore,
    topicsCompleted: new Set(attempts.map((attempt) => `${attempt.subjectId}:${attempt.topic}`)).size,
    averageQuizScore: averageScore,
    knowledgeGaps: data.knowledgeGaps.filter((gap) => gap.userId === userId).length,
    topicsDueForRevision: 0,
    totalSubjects: subjects.length,
    totalMaterials: materials.length,
    quizAttempts: attempts.length,
    subjects: subjectCards,
    materials: materials.map(serializeMaterial),
    recentMaterials: [...materials]
      .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
      .slice(0, 5)
      .map(serializeMaterial),
    reminders: [],
    recommendations: materials.length
      ? ["Open a material to study or ask Edvora when AI is configured."]
      : ["Create a subject and upload a learning material to get started."],
  };
}
