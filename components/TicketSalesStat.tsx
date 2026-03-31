import { formatNumber, percent } from "@/helpers/format";

function TicketSalesStat({ sold, total }: { sold: number; total: number }) {
  const pct = percent(sold, total);

  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/80">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Ticket Sales
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight text-purple-900 dark:text-white sm:text-2xl">
        {formatNumber(sold)}/{formatNumber(total)}
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-purple-700 dark:bg-purple-500"
          style={{ width: `${pct}%` }}
          aria-label={`${pct}% sold`}
        />
      </div>
    </div>
  );
}

export default TicketSalesStat;
