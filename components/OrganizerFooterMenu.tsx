import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import type { OrganizerProfile } from "@/helpers/type";

type Props = {
  organizerBranding?: Pick<
    OrganizerProfile,
    "name" | "tagline" | "description" | "socialLinks"
  >;
};

function OrganizerFooterMenu({ organizerBranding }: Props) {
  const socials = [
    {
      label: "X",
      href: organizerBranding?.socialLinks?.twitter,
      Icon: FaXTwitter,
    },
    {
      label: "Instagram",
      href: organizerBranding?.socialLinks?.instagram,
      Icon: FaInstagram,
    },
    {
      label: "Facebook",
      href: undefined,
      Icon: FaFacebookF,
    },
    {
      label: "LinkedIn",
      href: organizerBranding?.socialLinks?.linkedin,
      Icon: FaLinkedinIn,
    },
  ].filter((social) => Boolean(social.href));

  return (
    <div className="flex flex-col gap-8 text-left sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          {organizerBranding?.name || "Organizer"}
        </p>
        <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
          {organizerBranding?.description ||
            organizerBranding?.tagline ||
            "Explore upcoming events, updates, and organizer details."}
        </p>
      </div>

      {socials.length ? (
        <div className="flex items-center gap-4 sm:justify-end">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default OrganizerFooterMenu;
