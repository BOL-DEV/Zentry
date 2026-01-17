import Image from "next/image";
import { pastEvent } from "./PastEvent";

function PastEventCard({ event }: { event: pastEvent }) {
  const { attendees, imageUrl, title, date } = event;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-md overflow-hidden flex flex-col gap-3 lg:w-72 w-full pb-4 hover:scale-105 transition-transform">
      <Image
        src={imageUrl}
        width={300}
        height={100}
        alt={title}
        className="h-[65%] w-full object-cover"
      />
      <div className="flex flex-col gap-2 px-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
        <h2 className="font-bold text-lg dark:text-white">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {attendees} Attendees
        </p>
      </div>
    </div>
  );
}

export default PastEventCard;
