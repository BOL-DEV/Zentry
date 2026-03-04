import { LuSearch } from "react-icons/lu";

function EventSearch() {
  return (
    <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative w-full">
        <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
        <input
          type="search"
          placeholder="Search events by title..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:ring-4 focus:ring-purple-200/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500/60 dark:focus:ring-purple-500/15"
        />
      </div>
    </div>
  );
}

export default EventSearch;
