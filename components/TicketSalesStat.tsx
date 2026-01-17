import { formatNumber, percent } from "@/helpers/format";

function TicketSalesStat({ sold, total }: { sold: number; total: number }) {
  const pct = percent(sold, total);

  return (
    <div className="">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Ticket Sales
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight  text-purple-900 dark:text-white">
        {formatNumber(sold)}/{formatNumber(total)}
      </div>
      <div className="mt-2 h-2 w-64 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full  bg-purple-700 dark:bg-purple-500"
          style={{ width: `${pct}%` }}
          aria-label={`${pct}% sold`}
        />
      </div>
    </div>
  );
}

export default TicketSalesStat;
