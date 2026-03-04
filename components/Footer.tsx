import Company from "./Company";

interface Props {
  children: React.ReactNode;
}

function Footer({ children }: Props) {
  return (
    <footer className="border-t border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white ">
      <div className="mx-auto lg:max-w-7xl px-6 py-14">
        <>{children}</>

        <Company />
      </div>
    </footer>
  );
}

export default Footer;
