import type { ApiAuthResponse } from "@/helpers/type";

const TOKEN_KEY = "zentra:auth-token";
const USER_KEY = "zentra:auth-user";
const AUTH_CHANGE_EVENT = "zentra-auth-change";

export type AuthUser = ApiAuthResponse["data"]["user"];
export type AuthSession = {
  token: string;
  user: AuthUser | null;
};

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function readStorageValue(key: string) {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key) || "";
  } catch {
    return localStorage.getItem(key) || "";
  }
}

function writeStorageValue(key: string, value: string, persist: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (persist) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  } catch {
    localStorage.setItem(key, value);
  }
}

function removeStorageValue(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
  localStorage.removeItem(key);
}

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  return readStorageValue(TOKEN_KEY);
}

export function setAuthToken(token: string, options?: { persist?: boolean }) {
  if (typeof window === "undefined") return;
  writeStorageValue(TOKEN_KEY, token, options?.persist ?? true);
  emitAuthChange();
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = readStorageValue(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setAuthUser(user: AuthUser, options?: { persist?: boolean }) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(user);
  const persist = options?.persist ?? true;
  writeStorageValue(USER_KEY, payload, persist);
  emitAuthChange();
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  removeStorageValue(TOKEN_KEY);
  removeStorageValue(USER_KEY);
  emitAuthChange();
}
