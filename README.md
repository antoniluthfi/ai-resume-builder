# AI Resume Builder

Build an ATS-friendly resume once, then tailor it to any job description in
minutes instead of by hand. Paste a job posting and get an instant keyword
match score, AI-powered rewording suggestions, project relevance flags, and a
generated cover letter — all grounded strictly in your real experience, never
invented.

## Features

- **Resume builder** — personal info (incl. professional title), summary,
  experience, education, skills, projects, and certifications, with a live
  preview as you type.
- **ATS-safe export** — single-column, text-based PDF and DOCX exports (no
  rasterized images, no tables/columns that break ATS parsing).
- **Resume PDF upload** — upload an existing resume PDF and have AI read it
  directly (document understanding, so the original layout doesn't matter)
  to auto-fill the builder.
- **Instant keyword matching** — paste a job description and see a match
  percentage plus matched/missing keywords, computed entirely client-side
  with no API call.
- **AI tailoring** — reworded bullet/summary suggestions, professional title
  alternatives, project relevance detection (hide projects irrelevant to a
  given application), and confidently-implied missing skills (e.g. Laravel
  experience implies OOP) — all opt-in, one suggestion at a time, and never
  fabricated.
- **Cover letter generator** — a tailored cover letter grounded in your
  resume, editable, with copy/download/compose-email actions.
- **Bullet quality checklist** — a local, instant heuristic that flags weak
  bullets (passive phrasing, missing metrics, personal pronouns) with no AI
  call.
- **Resume versions, undo, and backup** — save named snapshots per job
  application, undo AI-driven edits, and export/import your resume data as
  JSON.
- **Bring your own API key (BYOK)** — works with Claude (Anthropic), GPT
  (OpenAI), or Gemini (Google). Each visitor supplies their own API key via
  the Settings panel; it's stored only in their browser's `localStorage` and
  sent straight through to the AI provider per-request — this app's server
  never stores it and has no shared API costs to run.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In the header, open
**Settings** and paste an API key for whichever provider you want to use
(Anthropic, OpenAI, or Gemini) — no server-side environment variables are
required for the AI features.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Zustand](https://github.com/pmndrs/zustand) for client state
- [@react-pdf/renderer](https://react-pdf.org) and [docx](https://docx.js.org) for exports
- [Anthropic](https://docs.anthropic.com), [OpenAI](https://platform.openai.com/docs), and [Google Gemini](https://ai.google.dev) SDKs for AI tailoring

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run lint    # run ESLint
```
