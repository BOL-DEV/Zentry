"use client";

import { useId, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  items: AccordionItem[];
  defaultOpenId?: string;
};

function Accordion({ items, defaultOpenId }: Props) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-200/70 bg-white dark:border-white/10 dark:bg-white/5">
      {items.map((item, idx) => {
        const isOpen = openId === item.id;
        const buttonId = `${baseId}-btn-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={idx === 0 ? "" : "border-t border-purple-200/70 dark:border-white/10"}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                {item.question}
              </span>
              <span
                className={`shrink-0 text-slate-600 transition-transform dark:text-slate-300 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                <IoChevronDown />
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={isOpen ? "px-6 pb-6" : "hidden"}
            >
              <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
