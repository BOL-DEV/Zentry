import type { ApiEnvelope } from "@/helpers/type";
import { getAuthToken } from "@/helpers/auth";
import { getAdminAuthToken } from "@/helpers/admin-auth";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const NETWORK_ERROR_MESSAGE =
  "You're offline or the server is unavailable. Check your internet connection and try again.";

function normalizeApiBaseUrl(value?: string) {
  const trimmed = value?.trim().replace(/\/+$/, "");

  if (!trimmed) return "http://localhost:4000/api/v1";
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api/v1`;
}


export function getClientDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("zentra_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("zentra_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl);

export function resolveUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

type ApiErrorLike = {
  message?: string;
  data?: unknown;
  errors?: Array<{
    message?: string;
  }>;
};

export function getApiErrorMessage(
  payload: ApiErrorLike | null,
  fallbackMessage: string,
) {
  const firstValidationMessage = payload?.errors?.find((item) => item.message)?.message;
  const nestedMessage =
    payload?.data &&
      typeof payload.data === "object" &&
      "message" in payload.data &&
      typeof payload.data.message === "string"
      ? payload.data.message
      : undefined;

  return (
    payload?.message ||
    nestedMessage ||
    firstValidationMessage ||
    fallbackMessage
  );
}

export async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return null;
  }
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
  const isFormDataBody = typeof FormData !== "undefined" && init?.body instanceof FormData;
  let response: Response;

  try {
    response = await fetch(resolveUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(typeof window !== "undefined" ? { "x-client-id": getClientDeviceId() } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

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
    let cleanFallback = responseText.trim();
    if (cleanFallback.startsWith("<") || cleanFallback.includes("<!DOCTYPE")) {
      cleanFallback =
        response.status === 404
          ? "This endpoint is not available on the current server. If connected to live, the latest backend branch needs to be deployed."
          : `Server error (${response.status}). Please try again.`;
    }

    const fallbackMessage =
      response.status >= 500
        ? "The server is having trouble right now. Please try again shortly."
        : cleanFallback;
    throw new Error(
      getApiErrorMessage(
        payload,
        fallbackMessage || "We couldn't complete that request. Please try again.",
      ),
    );
  }

  if (!payload) {
    throw new Error("The server returned an unexpected response. Please try again.");
  }

  return payload;
}
