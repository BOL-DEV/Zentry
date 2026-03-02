import Link from "next/link";
import { useState } from "react";
import { menuDataProps } from "../helpers/type";
import { useParams } from "next/navigation";

function HeaderMenu(props: menuDataProps) {
  const { organizer } = useParams();

  // organizer &&

  // console.log(url);

  const handleUrl = (href: string) => {
    let url = "";

    if (organizer) {
      url = `/${organizer}${href}`;
    } else {
      url = href;
    }

    return url;
  };

  const { menuData } = props;
  const [activeMenu, setActiveMenu] = useState<string>("Home");

  const handleMenuClick = (name: string) => {
    setActiveMenu(name);
  };

  return (
    <nav className="hidden  lg:flex items-center">
      {/* Desktop links */}
      <ul className="list-none items-center gap-8 pr-6 text-xs font-medium uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300 lg:flex">
        {menuData.map((item) => (
          <li key={item.name} onClick={() => handleMenuClick(item.name)}>
            <Link
              href={{
                pathname: handleUrl(item.href),
                // query: { slug: "1" },
              }}
              className={`rounded-xl p-3 font-semibold transition hover:bg-purple-200 hover:text-purple-700 dark:hover:bg-white/5 dark:hover:text-white ${
                activeMenu === item.name
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
