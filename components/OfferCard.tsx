import { OfferProps } from "./Offer";

function OfferCard({ icon, title, description }: OfferProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-300 bg-purple-100 p-6  text-slate-900 text-left dark:border-white/10 dark:bg-slate-800 dark:text-white ">
      <h1 className="text-4xl p-2 bg-purple-300 dark:bg-slate-950/90 w-fit rounded-md">
        {icon}
      </h1>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-md w-xs">{description}</p>
    </div>
  );
}

export default OfferCard;
