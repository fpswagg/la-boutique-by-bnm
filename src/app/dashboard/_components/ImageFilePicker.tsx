"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dashboardFr } from "@/lib/dashboard/fr";

type ImageFilePickerProps = {
  name: string;
};

export function ImageFilePicker({ name }: ImageFilePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        key: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const syncInput = useCallback((nextFiles: File[]) => {
    setFiles(nextFiles);
    if (!inputRef.current) return;
    const dataTransfer = new DataTransfer();
    nextFiles.forEach((file) => dataTransfer.items.add(file));
    inputRef.current.files = dataTransfer.files;
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    syncInput(picked);
  }

  function removeAt(index: number) {
    syncInput(files.filter((_, currentIndex) => currentIndex !== index));
  }

  function addFromFileList(list: FileList | File[]) {
    const incoming = Array.from(list).filter((file) => file.type.startsWith("image/"));
    if (!incoming.length) return;
    syncInput([...files, ...incoming]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer?.files?.length) {
      addFromFileList(event.dataTransfer.files);
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        {dashboardFr.productForm.sections.images}
      </p>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragActive(false);
          }
        }}
        onDrop={onDrop}
        className={`rounded-md border border-dashed p-6 text-center transition-colors ${
          dragActive ? "border-[var(--fg)] bg-[var(--surface-2)]" : "border-[var(--border)] bg-[var(--bg)]"
        }`}
      >
        <p className="text-sm text-[var(--muted)]">{dashboardFr.productForm.images.dropHint}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">{dashboardFr.productForm.images.formatsHint}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={dashboardFr.productForm.images.chooseFilesAria}
          className="mt-4 px-4 py-2 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase tracking-widest"
        >
          {dashboardFr.productForm.images.addMore}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        multiple
        onChange={onFileChange}
        aria-label={dashboardFr.productForm.images.chooseFilesAria}
        className="sr-only"
      />

      {previews.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{dashboardFr.productForm.images.noImage}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {previews.map((preview, index) => (
            <div key={preview.key} className="border border-[var(--border)] bg-[var(--bg)] p-3">
              <div
                aria-hidden
                className="w-full aspect-square bg-center bg-cover border border-[var(--border)]"
                style={{ backgroundImage: `url("${preview.url}")` }}
              />
              <p className="mt-2 text-xs break-all text-[var(--muted)]">{preview.name}</p>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="mt-2 w-full px-2 py-1 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase tracking-widest"
              >
                {dashboardFr.productForm.images.remove}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
