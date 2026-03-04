import Image from "next/image";

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  dateText: string;
  imageUrl: string;
};

const galleryItems: GalleryItem[] = [
  {
    id: "tech-summit-opening-keynote",
    title: "Tech Summit Opening Keynote",
    description: "Industry leaders discussing the future of technology.",
    category: "Conference",
    dateText: "March 15, 2024",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/ai-summit-event.jpg",
  },
  {
    id: "attendees-networking",
    title: "Attendees Networking",
    description: "Professionals connecting and sharing ideas.",
    category: "Conference",
    dateText: "March 15, 2024",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
  },
  {
    id: "main-stage-performance",
    title: "Main Stage Performance",
    description: "Electric performance by top artists.",
    category: "Concert",
    dateText: "April 20, 2024",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/marketing-conference-digital.jpg",
  },
  {
    id: "workshop-breakout-session",
    title: "Workshop Breakout Session",
    description: "Hands-on learning with guided exercises.",
    category: "Workshop",
    dateText: "May 3, 2024",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/mobile-development-workshop.jpg",
  },
  {
    id: "vip-reception",
    title: "VIP Reception",
    description: "An intimate evening with special guests and partners.",
    category: "Networking",
    dateText: "May 18, 2024",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/tech-conference-stage.jpg",
  },
  {
    id: "expo-floor",
    title: "Expo Floor",
    description: "Discover demos, booths, and brand activations.",
    category: "Conference",
    dateText: "June 1, 2024",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/web-development-training.jpg",
  },
];

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="relative aspect-4/3 w-full">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
            {item.category}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {item.dateText}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {item.description}
        </p>
      </div>
    </article>
  );
}

function Page() {
  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <header className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Event Gallery
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Explore stunning moments and memories from our past events.
          </p>
        </header>

        {/* Intentionally no tab switches / category filters */}

        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </section>
      </div>
    </main>
  );
}

export default Page;
