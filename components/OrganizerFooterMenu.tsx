import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const socials = [
  {
    label: "X",
    href: "#",
    Icon: FaXTwitter,
  },
  {
    label: "Instagram",
    href: "#",
    Icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "#",
    Icon: FaFacebookF,
  },
  {
    label: "LinkedIn",
    href: "#",
    Icon: FaLinkedinIn,
  },
];

function OrganizerFooterMenu() {
  return (
    <div className="flex flex-col gap-8 text-left sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Pulse Events
        </p>
        <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
          Creating unforgettable experiences through innovative event management.
        </p>
      </div>

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
    </div>
  );
}

export default OrganizerFooterMenu;
