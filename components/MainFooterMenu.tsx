import Link from "next/link";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Browse Events", href: "/events" },
      { label: "Pricing", href: "/offers#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/contact-us" },
      { label: "FAQ", href: "/offers#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/contact-us" },
    ],
  },
];

function MainFooterMenu() {

    return (
      <div className="grid gap-10 lg:grid-cols-12 text-left">
        <div className="lg:col-span-5">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-2xl text-white">
              ⚡
            </span>
            <span className="text-xl font-bold text-purple-600">EventFlow</span>
          </Link>
          <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-300">
            Professional event management for everyone.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 dark:text-slate-300">
                {group.title}
              </p>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition hover:text-purple-700 dark:text-slate-300 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
}

export default MainFooterMenu
