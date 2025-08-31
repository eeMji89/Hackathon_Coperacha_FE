// src/lib/rest.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function buildUrl(path: string) {
  return path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }
  // @ts-expect-error (puede no tener body en 204)
  return res.status === 204 ? undefined : (res.json() as Promise<T>);
}

export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), { ...init, method: "GET", cache: "no-store" });
  return handle<T>(res);
}

export async function postJSON<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}

export async function patchJSON<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...init,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}
