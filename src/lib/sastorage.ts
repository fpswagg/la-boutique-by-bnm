const DEFAULT_SA_STORAGE_URL = "https://sastorage.fpswagg.site";

type SaStorageObject = {
  key: string;
  size?: number;
  lastModified?: string;
  contentType?: string | null;
  etag?: string;
};

function storageBaseUrl(): string {
  const raw = process.env.SA_STORAGE_URL?.trim() || DEFAULT_SA_STORAGE_URL;
  return raw.replace(/\/+$/, "");
}

function storageToken(): string | null {
  const token = process.env.SA_STORAGE_TOKEN?.trim();
  return token || null;
}

export function isSaStorageConfigured(): boolean {
  return Boolean(storageToken());
}

export function getSaStoragePublicUrl(key: string): string {
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${storageBaseUrl()}/files/${encoded}`;
}

function apiKeyPath(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // ignore non-JSON
  }
  return text.slice(0, 400) || response.statusText;
}

export function getStoragePathFromPublicUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const filesMarker = "/files/";
    const idx = parsed.pathname.indexOf(filesMarker);
    if (idx === -1) return null;
    const encoded = parsed.pathname.slice(idx + filesMarker.length);
    if (!encoded) return null;
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

export async function uploadStorageFile(input: {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
  fileName?: string;
}): Promise<string> {
  const token = storageToken();
  if (!token) {
    throw new Error("Missing SA_STORAGE_TOKEN environment variable.");
  }

  const fileName = input.fileName || input.key.split("/").pop() || "upload.bin";
  const blob = new Blob([new Uint8Array(input.body)], {
    type: input.contentType || "application/octet-stream",
  });
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("key", input.key);

  const response = await fetch(`${storageBaseUrl()}/api/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const json = (await response.json()) as { object?: SaStorageObject };
  const storedKey = json.object?.key || input.key;
  return getSaStoragePublicUrl(storedKey);
}

export async function deleteStorageFiles(keys: string[]): Promise<void> {
  const token = storageToken();
  if (!token || keys.length === 0) return;

  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  const failures: string[] = [];

  for (const key of uniqueKeys) {
    const response = await fetch(`${storageBaseUrl()}/api/files/${apiKeyPath(key)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok && response.status !== 404) {
      failures.push(`${key}: ${await readErrorMessage(response)}`);
    }
  }

  if (failures.length) {
    console.warn("Impossible de supprimer certains fichiers SAStorage :", failures.join("; "));
  }
}
