import type { ApiAdminAuthResponse } from "@/helpers/type";

const ADMIN_TOKEN_KEY = "zentra:admin-auth-token";
const ADMIN_USER_KEY = "zentra:admin-auth-user";
const ADMIN_AUTH_CHANGE_EVENT = "zentra-admin-auth-change";

export type AdminAuthUser = ApiAdminAuthResponse["data"]["admin"];
export type AdminAuthSession = {
  token: string;
  user: AdminAuthUser | null;
};

function emitAdminAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
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

export function getAdminAuthToken() {
  if (typeof window === "undefined") return "";
  return readStorageValue(ADMIN_TOKEN_KEY);
}

export function setAdminAuthToken(token: string, options?: { persist?: boolean }) {
  if (typeof window === "undefined") return;
  writeStorageValue(ADMIN_TOKEN_KEY, token, options?.persist ?? true);
  emitAdminAuthChange();
}

export function getAdminAuthUser(): AdminAuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = readStorageValue(ADMIN_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminAuthUser;
  } catch {
    localStorage.removeItem(ADMIN_USER_KEY);
    return null;
  }
}

export function setAdminAuthUser(user: AdminAuthUser, options?: { persist?: boolean }) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(user);
  writeStorageValue(ADMIN_USER_KEY, payload, options?.persist ?? true);
  emitAdminAuthChange();
}

export function clearAdminAuthToken() {
  if (typeof window === "undefined") return;
  removeStorageValue(ADMIN_TOKEN_KEY);
  removeStorageValue(ADMIN_USER_KEY);
  emitAdminAuthChange();
}

export const ADMIN_AUTH_EVENT_NAME = ADMIN_AUTH_CHANGE_EVENT;
