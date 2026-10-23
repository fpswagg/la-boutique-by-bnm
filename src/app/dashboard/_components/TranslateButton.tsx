"use client";

import { useRef, useState, useTransition } from "react";
import { translateProductAction } from "../actions";

type Field = HTMLInputElement | HTMLTextAreaElement;

/** Fills the EN and TR fields from the French ones (machine translation, to check before saving). */
export function TranslateButton() {
  const ref = useRef<HTMLDivElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function run() {
    const form = ref.current?.closest("form");
    if (!form) return;
    const field = (name: string) => form.elements.namedItem(name) as Field | null;
    const fr = { name: field("nameFr")?.value ?? "", category: field("categoryFr")?.value ?? "", description: field("descriptionFr")?.value ?? "" };
    if (!fr.name.trim() && !fr.category.trim() && !fr.description.trim()) {
      setMsg({ ok: false, text: "Remplissez d'abord les champs en français." });
      return;
    }
    setMsg(null);
    start(async () => {
      const res = await translateProductAction(fr).catch((e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : "Traduction impossible." }));
      if (!res.ok) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      for (const lang of ["en", "tr"] as const) {
        const suffix = lang === "en" ? "En" : "Tr";
        for (const key of ["name", "category", "description"] as const) {
          const el = field(`${key}${suffix}`);
          if (el && res[lang][key]) el.value = res[lang][key];
        }
      }
      setMsg({ ok: true, text: "Traductions ajoutées. Vérifiez-les puis enregistrez." });
    });
  }

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="min-h-10 px-4 border border-[var(--border)] bg-[var(--surface)] text-sm hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Traduction…" : "Traduire FR → EN / TR"}
      </button>
      {msg ? <span className={`text-xs ${msg.ok ? "text-[var(--muted)]" : "text-red-600"}`}>{msg.text}</span> : null}
    </div>
  );
}
