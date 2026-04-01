import type { Locale } from "../../middleware";

import fr from "../dictionaries/fr.json";
import en from "../dictionaries/en.json";
import tr from "../dictionaries/tr.json";

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.fr;
}

/** Resolve a translatable field { en, fr, tr } to the active locale string */
export function t(
  field: { en: string; fr: string; tr: string },
  locale: Locale
): string {
  return field[locale] ?? field.fr;
}
