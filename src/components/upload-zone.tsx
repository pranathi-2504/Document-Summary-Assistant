"use client";

import { useRef, useState } from "react";
import { FileUp, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_BYTES } from "@/lib/file-validation";
import { formatBytes } from "@/lib/utils";

interface UploadZoneProps {
  disabled: boolean;
  onFileSelected: (file: File) => void;
}

export function UploadZone({ disabled, onFileSelected }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onDropFile = (file: File | null) => {
    if (!file || disabled) return;
    onFileSelected(file);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Upload Document</h2>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload document"
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const droppedFile = event.dataTransfer.files?.[0] ?? null;
          onDropFile(droppedFile);
        }}
        className={cn(
          "group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          isDragging && !disabled
            ? "border-indigo-500 bg-indigo-50/60"
            : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/40",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {disabled ? (
          <FileWarning className="mb-3 size-10 text-slate-400" aria-hidden="true" />
        ) : (
          <FileUp
            className={cn(
              "mb-3 size-10 transition",
              isDragging ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500",
            )}
            aria-hidden="true"
          />
        )}
        <p className="text-lg font-semibold text-slate-900">Drop your document here</p>
        <p className="mt-1 text-sm text-slate-600">or click to browse</p>
        <p className="mt-4 text-xs text-slate-500">Supported: PDF, PNG, JPG, JPEG</p>
        <p className="mt-1 text-xs text-slate-500">Maximum file size: {formatBytes(MAX_FILE_SIZE_BYTES)}</p>
      </div>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          onDropFile(selected ?? null);
          event.currentTarget.value = "";
        }}
        disabled={disabled}
      />
    </section>
  );
}
