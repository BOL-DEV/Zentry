"use client";

import { useSyncExternalStore } from "react";

import {
  ADMIN_AUTH_EVENT_NAME,
  getAdminAuthToken,
  getAdminAuthUser,
} from "@/helpers/admin-auth";
import type { AdminAuthSession } from "@/helpers/admin-auth";

const EMPTY_ADMIN_AUTH_SESSION: AdminAuthSession = { token: "", user: null };
let cachedSession: AdminAuthSession = { token: "", user: null };
let cachedUserKey = "null";

function readAdminAuthSession(): AdminAuthSession {
  const token = getAdminAuthToken();
  const user = getAdminAuthUser();
  const userKey = user ? JSON.stringify(user) : "null";

  if (cachedSession.token === token && cachedUserKey === userKey) {
    return cachedSession;
  }

  cachedUserKey = userKey;
  cachedSession = {
    token,
    user,
  };

  return cachedSession;
}

export function useAdminAuthSession(): AdminAuthSession {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleChange = () => onStoreChange();
      window.addEventListener("storage", handleChange);
      window.addEventListener(ADMIN_AUTH_EVENT_NAME, handleChange);

      return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener(ADMIN_AUTH_EVENT_NAME, handleChange);
      };
    },
    readAdminAuthSession,
    () => EMPTY_ADMIN_AUTH_SESSION,
  );
}
