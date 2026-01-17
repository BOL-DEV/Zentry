
function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}
export function percent(sold: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return clampPercent(Math.round((sold / total) * 100));
}



export function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

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