import "server-only";

/**
 * Machine translation from French, for the dashboard "Traduire" button.
 * DeepL API Free when DEEPL_API_KEY is set (better quality, 500k chars/month),
 * otherwise MyMemory (free, no key; MYMEMORY_EMAIL raises its daily quota).
 */

export type Lang = "en" | "tr";

async function deepl(texts: string[], to: Lang, key: string): Promise<string[]> {
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: { authorization: `DeepL-Auth-Key ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ text: texts, source_lang: "FR", target_lang: to === "en" ? "EN-GB" : "TR" }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DeepL a répondu ${res.status}`);
  const body = (await res.json()) as { translations?: Array<{ text: string }> };
  return (body.translations ?? []).map((t) => t.text);
}

async function myMemoryOne(text: string, to: Lang): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `fr|${to}`);
  if (process.env.MYMEMORY_EMAIL) url.searchParams.set("de", process.env.MYMEMORY_EMAIL);
  const res = await fetch(url, { cache: "no-store" });
  const body = (await res.json().catch(() => null)) as { responseStatus?: number | string; responseData?: { translatedText?: string }; quotaFinished?: boolean } | null;
  if (!res.ok || !body || Number(body.responseStatus) !== 200) {
    throw new Error(body?.quotaFinished ? "Quota de traduction du jour atteint, réessayez demain." : "Le service de traduction ne répond pas.");
  }
  return body.responseData?.translatedText ?? "";
}

/** MyMemory takes 500 bytes per request: long texts go sentence by sentence. */
async function myMemory(text: string, to: Lang): Promise<string> {
  if (Buffer.byteLength(text) <= 480) return myMemoryOne(text, to);
  const parts = text.match(/[^.!?\n]+[.!?]*\s*|\n+/g) ?? [text];
  const out: string[] = [];
  for (const part of parts) out.push(part.trim() ? (await myMemoryOne(part.trim(), to)) + (/\s$/.test(part) ? part.match(/\s+$/)![0] : "") : part);
  return out.join("");
}

/** Translates each text (empty ones stay empty) into `to`. */
export async function translateFromFrench(texts: string[], to: Lang): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY;
  const idx = texts.map((t, i) => (t.trim() ? i : -1)).filter((i) => i >= 0);
  const out = texts.map(() => "");
  if (!idx.length) return out;
  const done = key ? await deepl(idx.map((i) => texts[i]), to, key) : await Promise.all(idx.map((i) => myMemory(texts[i], to)));
  idx.forEach((i, n) => (out[i] = done[n] ?? ""));
  return out;
}
