import Image from "next/image";

type PlatformLogoProps = {
  className?: string;
  priority?: boolean;
};

function PlatformLogo({
  className = "h-12 w-12",
  priority = false,
}: PlatformLogoProps) {
  return (
    <span className={`relative block overflow-hidden rounded-2xl ${className}`}>
      <Image
        src="/logo for white.png"
        alt="Zentry logo"
        fill
        className="object-contain object-left dark:hidden"
        sizes="48px"
        priority={priority}
      />
      <Image
        src="/logo for black.png"
        alt="Zentry logo"
        fill
        className="hidden object-contain object-left dark:block"
        sizes="48px"
        priority={priority}
      />
    </span>
  );
}

export default PlatformLogo;
