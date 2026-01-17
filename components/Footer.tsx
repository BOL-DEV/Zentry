function Footer() {
  return (
    <footer className="border-t border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
      <div className="mx-auto flex lg:max-w-7xl flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          &copy; {new Date().getFullYear()} EventFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
