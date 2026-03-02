import Link from 'next/link'


interface LogoProps {
  homeLink?: string;
  name: string;
  logoSrc?: string;
}

function Logo({ homeLink = "/", name, logoSrc = "⚡" }: LogoProps) {
  return (
   
      <Link
        href={homeLink}
        className="flex items-center gap-3 text-lg font-semibold"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-2xl">{logoSrc}</span>
        <span className="text-purple-600 text-xl font-bold">{name}</span>
      </Link>
  );
}

export default Logo
