"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface LogoProps {
  homeLink?: string;
  name: string;
  logoSrc?: string;
}

function isProbablyUrl(value?: string) {
  return Boolean(value && /^(https?:)?\/\//i.test(value));
}

function getFallbackMark(name: string) {
  return name.trim().charAt(0).toUpperCase() || "Z";
}

function Logo({ homeLink = "/", name, logoSrc }: LogoProps) {
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
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-purple-600 text-base text-white">
        {logoSrc && isProbablyUrl(logoSrc) ? (
          <Image
            src={logoSrc}
            alt={`${name} logo`}
            fill
            className="object-cover"
            sizes="40px"
            unoptimized
          />
        ) : (
          <span aria-hidden>{logoSrc || getFallbackMark(name)}</span>
        )}
      </span>
      <span className="text-xl font-bold text-purple-600">{name}</span>
    </Link>
  );
}

export default Logo;
