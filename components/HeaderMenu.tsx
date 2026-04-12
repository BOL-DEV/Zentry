import Link from "next/link";
import { menuDataProps } from "../helpers/type";
import { useParams, usePathname } from "next/navigation";

function HeaderMenu(props: menuDataProps) {
  const { organizer } = useParams();
  const pathname = usePathname();

  const handleUrl = (href: string) => {
    if (href.startsWith("/#") || href.startsWith("#")) {
      return href;
    }

    let url = "";

    if (organizer) {
      url = `/${organizer}${href}`;
    } else {
      url = href;
    }

    return url;
  };

  const { menuData } = props;

  const isActive = (href: string) => {
    if (!pathname) return false;

    if (href === "/") {
      return organizer ? pathname === `/${organizer}` : pathname === "/";
    }

    if (href.startsWith("/#") || href.startsWith("#")) {
      const normalized = href.replace(/^\/#/, "").replace(/^#/, "");
      return pathname === `/${normalized}` || pathname.endsWith(`/${normalized}`);
    }

    const target = organizer ? `/${organizer}${href}` : href;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  return (
    <nav className="hidden  lg:flex items-center">
      {/* Desktop links */}
      <ul className="list-none items-center gap-8 pr-6 text-xs font-medium uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300 lg:flex">
        {menuData.map((item) => (
          <li key={item.name}>
            <Link
              href={handleUrl(item.href)}
              className={`rounded-xl p-3 font-semibold transition hover:bg-purple-200 hover:text-purple-700 dark:hover:bg-white/5 dark:hover:text-white ${
                isActive(item.href)
                  ? "bg-purple-200 text-purple-700 dark:bg-white/10 dark:text-white"
                  : ""
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default HeaderMenu;
