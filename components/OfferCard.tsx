import { OfferProps } from "./Offer";

function OfferCard({ icon, title, description }: OfferProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-300 bg-purple-100 p-6 text-left text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
      <h1 className="w-fit rounded-md bg-purple-300 p-2 text-4xl dark:bg-white/10 dark:text-purple-200">
        {icon}
      </h1>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-md w-xs">{description}</p>
    </div>
  );
}

export default OfferCard;
