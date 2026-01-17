import PastEventCard from './PastEventCard';

export interface pastEvent {
    id: number;
    title: string;
    date: string;
    imageUrl: string;
    attendees: number;
}

const pastEventData: pastEvent[] = [
  {
    id: 1,
    title: "Tech Conference 2023",
    date: "March 15, 2023",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/ai-summit-event.jpg",
    attendees: 500,
  },
  {
    id: 2,
    title: "Art & Design Expo",
    date: "June 10, 2023",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/web-development-training.jpg",
    attendees: 300,
  },
  {
    id: 3,
    title: "Music Festival 2023",
    date: "August 25, 2023",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/marketing-conference-digital.jpg",
    attendees: 800,
  },
  {
    id: 4,
    title: "Health & Wellness Retreat",
    date: "October 5, 2023",
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/mobile-development-workshop.jpg",
    attendees: 200,
  },
];

function PastEvent() {
    // const {} = props

    return (
      <section className="flex flex-col gap-8 py-20 p-5 bg-purple-100  dark:bg-slate-950/90">
        <div className="flex flex-col gap-2 lg:pl-80">
          <h1 className="text-4xl font-bold dark:text-white">
            Past Events Gallery
          </h1>
          <h3 className="text-lg text-slate-600 dark:text-slate-400">
            Explore some of our most memorable events and see what our organizer
            have created.
          </h3>
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-6 ">
          {pastEventData.map((event: pastEvent) => (
            <PastEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    );
}

export default PastEvent
