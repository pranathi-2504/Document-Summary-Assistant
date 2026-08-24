import type { SummaryLength } from "@/types/summary";
import { cn } from "@/lib/utils";

interface SummaryOptionsProps {
  value: SummaryLength;
  disabled: boolean;
  onChange: (value: SummaryLength) => void;
}

const options: Array<{ value: SummaryLength; label: string; description: string }> = [
  { value: "short", label: "SHORT", description: "Very concise • around 3-5 sentences." },
  { value: "medium", label: "MEDIUM", description: "Balanced summary • 1-3 short paragraphs." },
  { value: "long", label: "LONG", description: "Detailed summary • multiple focused paragraphs." },
];

export function SummaryOptions({ value, onChange, disabled }: SummaryOptionsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Summary Length</h3>
      <p className="mt-1 text-sm text-slate-600">
        Choose how detailed the AI summary should be before generating insights.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              value === option.value
                ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              disabled && "cursor-not-allowed opacity-60",
            )}
            aria-pressed={value === option.value}
          >
            <p className="text-xs font-semibold tracking-wide">{option.label}</p>
            <p className="mt-1 text-xs">{option.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
