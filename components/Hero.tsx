import React from 'react'
import Image from 'next/image'
import { IoArrowForward } from "react-icons/io5";
import { LuSparkles } from "react-icons/lu";

// interface Props {}

function Hero() {
    // const {} = props

    return (
      <section className="bg-purple-100 dark:bg-slate-950/90 flex lg:gap-15  items-center justify-center px-6 py-20">
        <div className="flex flex-col gap-8">
          <h1 className="flex items-center gap-3 text-md font-semibold bg-purple-300 rounded-2xl px-5 py-1.5 text-purple-900 w-fit">
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
            EventFlow is your complete event management platform. From ticketing
            to attendee verification, we handle it all so you can focus on
            creating memorable experiences.
          </p>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold transition hover:bg-purple-700 w-fit">
              Browse Events
              <span>
                <IoArrowForward />
              </span>
            </button>
            <button className="flex items-center gap-2 font-semibold rounded-lg border-2 border-purple-600 px-6 py-3 text-purple-600 transition hover:bg-purple-700 hover:text-white w-fit">
              Oraganize an Event
            </button>
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
