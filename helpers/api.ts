import type { ApiEnvelope } from "@/helpers/type";
import { getAuthToken } from "@/helpers/auth";
import { getAdminAuthToken } from "@/helpers/admin-auth";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function normalizeApiBaseUrl(value?: string) {
  const trimmed = value?.trim().replace(/\/+$/, "");

  if (!trimmed) return "http://localhost:4000/api/v1";
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api/v1`;
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl);

export function resolveUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean | "admin" },
): Promise<ApiEnvelope<T>> {
  const token =
    init?.auth === "admin"
      ? getAdminAuthToken()
      : init?.auth
        ? getAuthToken()
        : "";
  const response = await fetch(resolveUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const responseText = await response.text();
  let payload: ApiEnvelope<T> | null = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as ApiEnvelope<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const fallbackMessage = responseText.trim();
    throw new Error(
      payload?.message ||
        fallbackMessage ||
        `Request failed with status ${response.status}`,
    );
  }

  if (!payload) {
    throw new Error("The server returned an empty response.");
  }

  return payload;
}
