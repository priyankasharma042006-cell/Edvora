# Edvora

Edvora is a local learning workspace for organizing subjects and study files, with optional AI-assisted study tools.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, add a subject, then upload a learning file from the subject page or the Materials page.

## Local storage and file support

- Account, subject, and material metadata are stored in `data/edvora.json`.
- Uploaded files are saved under `data/uploads/` on the machine running Next.js. They are scoped by owner and subject in the metadata, and are not publicly served.
- These files are local development storage, not cloud backups. Do not use this storage mode for a multi-instance or production deployment.
- Supported uploads: PDF, PPT/PPTX, DOC/DOCX, TXT, PNG, JPG/JPEG. The current maximum is 25 MB per file.
- Content extraction currently supports plain `.txt` only. Other formats can be stored and downloaded, but Edvora reports that analysis is unsupported rather than claiming to have read them.

## AI features

AI summaries, notes, quizzes, flashcards, and Ask Edvora require a configured OpenAI API key. Set `OPENAI_API_KEY` in the environment before starting the app. Optionally set `OPENAI_MODEL` to choose a model; the default is `gpt-4o-mini`.

When a student explicitly requests AI output, the selected `.txt` material's text is sent to OpenAI. When the key is absent, the UI displays a clear configuration message and does not substitute generated-looking demo answers.

## Checks

```bash
npm run lint
npm run build
```

## Prototype limitations

The current persistence layer uses local JSON and filesystem storage and is intended for a single local development instance. Authentication and storage should be replaced with production-grade session management and a managed database/object store before deployment. Password-reset email delivery, non-text document parsing, OCR, and long-term cloud backups are not configured.
