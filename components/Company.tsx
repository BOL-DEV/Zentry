
function Company() {
  return (
    <div className="mt-12 border-t border-purple-200/70 pt-8 dark:border-white/10">
      <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          &copy; {new Date().getFullYear()} Zentra. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Company;
