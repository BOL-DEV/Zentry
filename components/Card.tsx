import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

function Card({ children, className }: Props) {
  return (
    <div
      className={`rounded-2xl border border-purple-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

export default Card;
