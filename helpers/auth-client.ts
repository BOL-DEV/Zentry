"use client";

import { useSyncExternalStore } from "react";
import { getAuthToken, getAuthUser } from "@/helpers/auth";
import type { AuthSession } from "@/helpers/auth";

const AUTH_CHANGE_EVENT = "zentry-auth-change";
let cachedSession: AuthSession = { token: "", user: null };
let cachedUserKey = "null";

function readAuthSession(): AuthSession {
  const token = getAuthToken();
  const user = getAuthUser();
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

export function useAuthSession(): AuthSession {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleChange = () => onStoreChange();
      window.addEventListener("storage", handleChange);
      window.addEventListener(AUTH_CHANGE_EVENT, handleChange);

      return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener(AUTH_CHANGE_EVENT, handleChange);
      };
    },
    readAuthSession,
    () => ({ token: "", user: null }),
  );
}
