import { ExternalLink, FileText, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Document Summary Assistant</p>
            <p className="text-xs text-slate-400">AI-powered extraction and insights</p>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <a
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            href="#how-it-works"
          >
            <Sparkles className="size-4" />
            How it works
          </a>
          <a
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="size-4" />
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}
