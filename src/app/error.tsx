"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)] text-[var(--fg)]">
      <div className="text-center max-w-md">
        <p className="font-display text-[clamp(4rem,15vw,10rem)] leading-none text-[var(--fg)]/10 select-none">
          Erreur
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider -mt-2 mb-3">
          UN PROBLÈME EST SURVENU
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Une erreur inattendue s&apos;est produite. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 border border-[var(--fg)] text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Réessayer
          </button>
          <Link
            href="/fr"
            className="inline-flex px-6 py-3 bg-[var(--fg)] text-[var(--bg)] text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Accueil boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
