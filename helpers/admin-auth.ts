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

export function getAdminAuthToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  emitAdminAuthChange();
}

export function getAdminAuthUser(): AdminAuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminAuthUser;
  } catch {
    localStorage.removeItem(ADMIN_USER_KEY);
    return null;
  }
}

export function setAdminAuthUser(user: AdminAuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  emitAdminAuthChange();
}

export function clearAdminAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  emitAdminAuthChange();
}

export const ADMIN_AUTH_EVENT_NAME = ADMIN_AUTH_CHANGE_EVENT;
