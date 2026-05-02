import Link from 'next/link'
import Image from 'next/image'
import { IoArrowForward } from "react-icons/io5";
import { LuSparkles } from "react-icons/lu";

// interface Props {}

function Hero() {
    // const {} = props

    return (
      <section className="bg-purple-100 dark:bg-slate-950/90 flex flex-col items-center justify-center gap-7 px-6 pb-20 pt-28 sm:pb-24 sm:pt-32 lg:flex-row lg:gap-15 lg:py-40">
        <div className="flex flex-col gap-8">
          <h1 className="flex w-fit items-center gap-3 rounded-2xl bg-purple-300 px-5 py-1.5 text-md font-semibold text-purple-900 dark:bg-white/10 dark:text-purple-200">
            <span>
              <LuSparkles />
            </span>
            Professional Event Management
          </h1>
          <h1 className="flex flex-col gap-3 text-6xl font-bold dark:text-white">
            Manage Events with
            <span className="text-purple-600">Confidence</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-300 lg:w-xl">
            Zentry is your complete event management platform. From ticketing to
            attendee verification, we handle it all so you can focus on creating
            memorable experiences.
          </p>

          <div className="flex flex-col lg:flex-row gap-4  items-center">
            <Link href="/events" className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold transition hover:bg-purple-700 lg:w-fit w-full justify-center">
              Browse Events
              <span>
                <IoArrowForward />
              </span>
            </Link>
            <Link href="/organizer-request" className="flex items-center justify-center gap-2 rounded-lg border-2 border-purple-600 px-6 py-3 font-semibold text-purple-600 transition hover:bg-purple-700 hover:text-white dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-500/15 dark:hover:text-white lg:w-fit w-full">
              Organize an Event
            </Link>
          </div>
        </div>
        <Image
          src="https://v0-event-web-app-prototype.vercel.app/tech-conference-stage.jpg"
          alt="Hero Image"
          width={600}
          height={450}
          className="rounded-lg shadow-lg hidden md:block"
        />
      </section>
    );
}

export default Hero
