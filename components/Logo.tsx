"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface LogoProps {
  homeLink?: string;
  name: string;
  logoSrc?: string;
}

function Logo({ homeLink = "/", name, logoSrc = "ƒs­" }: LogoProps) {
  const router = useRouter();
  const lastTapRef = useRef(0);

  function openAdminLogin() {
    router.push("/admin/login");
  }

  function handlePointerUp() {
    const now = Date.now();

    if (now - lastTapRef.current < 350) {
      lastTapRef.current = 0;
      openAdminLogin();
      return;
    }

    lastTapRef.current = now;
  }

  return (
    <Link
      href={homeLink}
      onDoubleClick={(event) => {
        event.preventDefault();
        openAdminLogin();
      }}
      onTouchEnd={handlePointerUp}
      className="flex items-center gap-3 text-lg font-semibold"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-2xl">
        {logoSrc}
      </span>
      <span className="text-xl font-bold text-purple-600">{name}</span>
    </Link>
  );
}

export default Logo;
