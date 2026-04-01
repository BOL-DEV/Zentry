"use client";

import { useSyncExternalStore } from "react";
import { getAuthToken, getAuthUser } from "@/helpers/auth";
import type { AuthSession } from "@/helpers/auth";

const AUTH_CHANGE_EVENT = "zentry-auth-change";

function readAuthSession(): AuthSession {
  return {
    token: getAuthToken(),
    user: getAuthUser(),
  };
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
