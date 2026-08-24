Document Summary Assistant solves a common workflow problem: extracting meaningful insights from mixed-quality documents quickly and safely. I implemented a Next.js 16 + TypeScript architecture with a single polished dashboard and a server API route for AI summarization.

The client validates file type/size, then runs extraction logic based on file type. Standard PDFs are parsed page-by-page with PDF.js and preserved with readable page separators. If extractable PDF text is insufficient, the app automatically falls back to scanned-PDF OCR by rendering pages to canvas and processing them with Tesseract.js. Image uploads use direct OCR with progress feedback.

After extraction, users can inspect/copy text, choose summary length (short/medium/long), and submit to `POST /api/summarize`. The server keeps `GEMINI_API_KEY` private, prompts Gemini for strict structured JSON, and applies robust parsing/validation before returning title, summary, key points, main ideas, and improvement suggestions.

UX emphasizes transparency: explicit stages, progress indicators, disabled actions during processing, readable error states, responsive layout, and one-click copy/download/reset actions. The project is Vercel-ready with environment-based configuration and no persistent document storage.
