import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  label: string;
  progress: number | null;
}

export function ProcessingStatus({ label, progress }: ProcessingStatusProps) {
  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-900">
        <Loader2 className="size-4 animate-spin" />
        <span>{label}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress ?? 35}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-xs text-indigo-700">
        {progress !== null ? `${Math.round(progress)}% complete` : "In progress"}
      </p>
    </section>
  );
}
