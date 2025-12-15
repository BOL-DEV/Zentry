import React from 'react'

// interface Props {}

function Stat() {
    // const {} = props

    return (
      <section className="flex flex-col lg:flex-row gap-10 justify-evenly p-15 bg-purple-300 dark:bg-slate-950/95 shadow-lg">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold text-purple-600">500+</h1>
          <h3 className="text-gray-800 dark:text-gray-400 text-md">
            {" "}
            Events Hosted
          </h3>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold text-purple-600">50k+</h1>
          <h3 className="text-gray-800 dark:text-gray-400 text-md">
            Tickets Sold
          </h3>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold text-purple-600">25k+</h1>
          <h3 className="text-gray-800 dark:text-gray-400 text-md">
            Happy Attendees
          </h3>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold text-purple-600">99.9%</h1>
          <h3 className="text-gray-800 dark:text-gray-400 text-md">Uptime</h3>
        </div>
      </section>
    );
}

export default Stat
