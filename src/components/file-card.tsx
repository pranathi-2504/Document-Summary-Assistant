import { File, FileImage, FileText, Trash2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface FileCardProps {
  file: File;
  status: string;
  onRemove: () => void;
  disabled: boolean;
}

export function FileCard({ file, status, onRemove, disabled }: FileCardProps) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const Icon = isPdf ? FileText : file.type.startsWith("image/") ? FileImage : File;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">
              {isPdf ? "PDF document" : "Image document"} • {formatBytes(file.size)}
            </p>
            <p className="mt-2 text-xs font-medium text-indigo-700">{status}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Remove selected document"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </section>
  );
}
