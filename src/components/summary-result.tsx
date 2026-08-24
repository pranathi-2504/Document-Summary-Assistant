import { Lightbulb, ListChecks, Sparkles, WandSparkles } from "lucide-react";
import type { SummaryLength, SummaryResult } from "@/types/summary";
import { ActionButtons } from "@/components/action-buttons";

interface SummaryResultProps {
  result: SummaryResult;
  summaryLength: SummaryLength;
  onReset: () => void;
}

export function SummaryResultPanel({ result, summaryLength, onReset }: SummaryResultProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Generated with AI</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{result.title}</h3>
          </div>
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
            {summaryLength}
          </span>
        </div>

        <ActionButtons result={result} summaryLength={summaryLength} onReset={onReset} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="size-5 text-indigo-600" />
            Summary
          </h4>
          <p className="whitespace-pre-wrap leading-7 text-slate-700">{result.summary}</p>
        </article>

        <div className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900">
              <ListChecks className="size-5 text-indigo-600" />
              Key Points
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {result.keyPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Lightbulb className="size-5 text-indigo-600" />
              Main Ideas
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {result.mainIdeas.map((idea) => (
                <li key={idea} className="flex gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <WandSparkles className="size-5 text-indigo-600" />
          Improvement Suggestions
        </h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {result.improvementSuggestions.map((suggestion) => (
            <li key={suggestion} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {suggestion}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
