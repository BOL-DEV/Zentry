"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PlatformBrand from "./PlatformBrand";

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
  const [imageFailed, setImageFailed] = useState(false);
  const showsPlatformBrand = !logoSrc;
  const shouldShowImage = isProbablyUrl(logoSrc) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [logoSrc]);

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
      className="text-lg font-semibold"
      aria-label={`${name} home`}
    >
      {showsPlatformBrand ? (
        <PlatformBrand
          logoClassName="h-11 w-11 sm:h-12 sm:w-12"
          textClassName="text-2xl font-bold text-purple-600 dark:text-purple-400"
          text={name}
          priority
        />
      ) : (
        <span className="flex items-center gap-2">
          <span className="relative block h-11 w-11 overflow-hidden rounded-2xl border border-purple-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 sm:h-12 sm:w-12">
            {shouldShowImage ? (
              <Image
                src={logoSrc!}
                alt={`${name} logo`}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-2xl bg-purple-100 text-lg font-bold text-purple-700 dark:bg-white/10 dark:text-purple-300">
                {getFallbackMark(name)}
              </span>
            )}
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {name}
          </span>
        </span>
      )}
    </Link>
  );
}

export default Logo;
