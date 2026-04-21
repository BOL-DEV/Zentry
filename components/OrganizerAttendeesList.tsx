"use client";

import { useMemo, useState } from "react";
import { LuDownload, LuSearch } from "react-icons/lu";
import { formatDateText } from "@/helpers/date";
import { downloadTicketImage } from "@/helpers/ticket-image";
import type { ApiEventAttendee } from "@/helpers/type";

function OrganizerAttendeesList({
  attendees,
  title,
  description,
  eventId,
  eventTitle,
  statusFilter = "all",
  maxHeightClass = "max-h-[28rem]",
}: {
  attendees: ApiEventAttendee[];
  title?: string;
  description?: string;
  eventId?: string;
  eventTitle?: string;
  statusFilter?: "all" | "checked-in" | "valid";
  maxHeightClass?: string;
}) {
  const [search, setSearch] = useState("");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("all");

  const ticketTypeOptions = useMemo(() => {
    return Array.from(
      new Set(
        attendees
          .map((attendee) => attendee.ticketType.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [attendees]);

  const filteredAttendees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return attendees.filter((attendee) => {
      const matchesStatus =
        statusFilter === "all" ? true : attendee.status === statusFilter;
      const matchesTicketType =
        ticketTypeFilter === "all"
          ? true
          : attendee.ticketType === ticketTypeFilter;

      if (!matchesStatus || !matchesTicketType) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        attendee.buyerName,
        attendee.buyerEmail,
        attendee.ticketCode,
        attendee.ticketType,
        attendee.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [attendees, search, statusFilter, ticketTypeFilter]);

  if (!attendees.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        No attendees found for this event yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      {(title || description) && (
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          {title ? (
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div className="border-b border-slate-200 p-4 dark:border-white/10">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search attendees..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
            />
          </div>

          <select
            value={ticketTypeFilter}
            onChange={(event) => setTicketTypeFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
          >
            <option value="all">All ticket types</option>
            {ticketTypeOptions.map((ticketType) => (
              <option key={ticketType} value={ticketType}>
                {ticketType}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredAttendees.length} of {attendees.length} attendees
        </p>
      </div>

      <div className={`overflow-auto ${maxHeightClass}`}>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <tr>
              <th className="px-5 py-4 font-semibold">Attendee</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Ticket Type</th>
              <th className="px-5 py-4 font-semibold">Ticket Code</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Purchased</th>
              <th className="px-5 py-4 font-semibold">Ticket Image</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {filteredAttendees.length > 0 ? (
              filteredAttendees.map((attendee) => (
                <tr
                  key={attendee.id}
                  className="text-slate-900 dark:text-white"
                >
                  <td className="px-5 py-4 font-semibold">
                    {attendee.buyerName}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {attendee.buyerEmail}
                  </td>
                  <td className="px-5 py-4">{attendee.ticketType}</td>
                  <td className="px-5 py-4 font-mono text-xs">
                    {attendee.ticketCode}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        attendee.status === "checked-in"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      {attendee.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {formatDateText(new Date(attendee.purchasedAt))}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={!eventId}
                      onClick={() => {
                        if (!eventId) return;

                        void downloadTicketImage({
                          eventId,
                          eventTitle,
                          ticketType: attendee.ticketType,
                          attendeeName: attendee.buyerName,
                          attendeeEmail: attendee.buyerEmail,
                          ticketCode: attendee.ticketCode,
                          ticketStatus: attendee.status,
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <LuDownload className="text-sm" />
                      Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-slate-600 dark:text-slate-300"
                >
                  No attendees matched your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrganizerAttendeesList;
