import { formatDateText, formatDateTimeText } from "@/helpers/date";
import { apiFetch, resolveUrl } from "@/helpers/api";
import type {
  AdminEventListItem,
  ApiAuthResponse,
  ApiDashboardSummary,
  ApiEvent,
  ApiEventAttendee,
  ApiGalleryItem,
  ApiOrganizer,
  ApiOrder,
  ApiOrderItem,
  ApiOrderStatus,
  ApiPaymentInitialization,
  ApiScannerSummary,
  ApiTicket,
  ApiTicketType,
  EventCardProps,
  OrganizerDashboardData,
  OrganizerEvent,
  OrganizerEventDetailsData,
  OrganizerGalleryItem,
  OrganizerPastEvent,
  OrganizerProfile,
  TicketType,
  TicketTypeBreak,
} from "@/helpers/type";

type OrganizerWithTickets = {
  organizer: Pick<ApiOrganizer, "_id" | "name" | "slug" | "heroTitle">;
  events: Array<ApiEvent & { ticketTypes: ApiTicketType[] }>;
};

type ApiPublicEventListItem = ApiEvent & {
  organizer?: {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
  };
  organizerName?: string;
  organizerSlug?: string;
  slug?: string;
  organizer_slug?: string;
};

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parsePolicies(value?: string) {
  if (!value) return [] as string[];

  const parts = value
    .split(/\r?\n|[;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [value];
}

function buildBuyHref(slug: string, eventId: string, ticketType: ApiTicketType) {
  if (!ticketType.isActive) return undefined;
  return `/${slug}/events/${eventId}/checkout?ticketTypeId=${ticketType._id}`;
}

function mapTicketType(
  ticketType: ApiTicketType,
  slug: string,
  eventId: string,
): TicketType {
  return {
    id: ticketType._id,
    name: titleCase(ticketType.name),
    description: ticketType.description || undefined,
    price: ticketType.price,
    sold: ticketType.quantitySold,
    remaining: Math.max(
      0,
      ticketType.quantityAvailable - ticketType.quantitySold,
    ),
    total: ticketType.quantityAvailable,
    isActive: ticketType.isActive,
    buyHref: buildBuyHref(slug, eventId, ticketType),
  };
}

function mapEventCard(
  event: ApiEvent,
  ticketTypes: ApiTicketType[],
  slug: string,
): EventCardProps {
  const mappedTicketTypes = ticketTypes
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((ticketType) => mapTicketType(ticketType, slug, event._id));

  return {
    id: event._id,
    imageUrl: event.posterUrl,
    title: event.title,
    description: event.description,
    dateTimeText: formatDateTimeText(new Date(event.date)),
    locationText: event.location,
    dressCode: event.dressCode || undefined,
    policies: parsePolicies(event.policies),
    ticketTypes: mappedTicketTypes,
  };
}

function mapPastEvent(
  event: ApiEvent,
  ticketTypes: ApiTicketType[],
): OrganizerPastEvent {
  const ticketsSold = ticketTypes.reduce(
    (sum, ticketType) => sum + ticketType.quantitySold,
    0,
  );

  return {
    id: event._id,
    title: event.title,
    dateText: formatDateText(new Date(event.date)),
    ticketsSold,
    imageUrl: event.posterUrl,
  };
}

function mapTicketBreak(ticketType: ApiTicketType): TicketTypeBreak {
  return {
    id: ticketType._id,
    name: titleCase(ticketType.name),
    price: ticketType.price,
    sold: ticketType.quantitySold,
    total: ticketType.quantityAvailable,
  };
}

function mapGalleryItem(item: ApiGalleryItem): OrganizerGalleryItem {
  return {
    id: item._id,
    imageUrl: item.imageUrl,
    title: item.caption || "Event moment",
    description: item.caption || "Captured from one of our organizer experiences.",
    altText: item.altText || item.caption || "Organizer gallery image",
    dateText: formatDateText(new Date(item.createdAt)),
  };
}

function mapOrganizerEvent(event: ApiEvent, ticketTypes: ApiTicketType[]): OrganizerEvent {
  const ticketBreakdown = ticketTypes
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map(mapTicketBreak);

  const capacitySold = ticketBreakdown.reduce((sum, ticket) => sum + ticket.sold, 0);
  const capacityTotal = ticketBreakdown.reduce(
    (sum, ticket) => sum + ticket.total,
    0,
  );
  const revenue = ticketBreakdown.reduce(
    (sum, ticket) => sum + ticket.price * ticket.sold,
    0,
  );

  return {
    id: event._id,
    title: event.title,
    dateTimeText: formatDateTimeText(new Date(event.date)),
    capacitySold,
    capacityTotal,
    revenue,
    checkIns: 0,
    checkInPercentage: 0,
    ticketTypesCount: ticketBreakdown.length,
    ticketTypes: ticketBreakdown,
  };
}

async function fetchOrganizer(slug: string) {
  const response = await apiFetch<{ organizer: ApiOrganizer }>(
    `/organizer/${slug}`,
  );

  return response.data.organizer;
}

async function fetchOrganizerEvents(slug: string) {
  const response = await apiFetch<{
    organizer: Pick<ApiOrganizer, "_id" | "name" | "slug">;
    events: ApiEvent[];
  }>(`/organizer/${slug}/events`);

  return response.data;
}

async function fetchAllEvents() {
  const response = await apiFetch<{
    events: ApiPublicEventListItem[];
  }>(`/events`);

  return response.data.events;
}

async function fetchOrganizerLandingEvents(slug: string) {
  const response = await apiFetch<{
    featuredEvent: ApiEvent | null;
    upcomingEvents: ApiEvent[];
    pastEvents: ApiEvent[];
  }>(`/organizer/${slug}/landing-events`);

  return response.data;
}

async function fetchOrganizerEvent(slug: string, eventId: string) {
  const response = await apiFetch<{
    organizer: Pick<ApiOrganizer, "_id" | "name" | "slug">;
    event: ApiEvent;
  }>(`/organizer/${slug}/events/${eventId}`);

  return response.data;
}

async function fetchOrganizerGallery(slug: string) {
  const response = await apiFetch<{
    organizer: { slug: string };
    results: number;
    gallery: ApiGalleryItem[];
  }>(`/organizer/${slug}/gallery`);

  return response.data.gallery;
}

async function fetchEventTicketTypes(slug: string, eventId: string) {
  const response = await apiFetch<{
    organizer: Pick<ApiOrganizer, "_id" | "name" | "slug">;
    event: { id: string; title: string };
    ticketTypes: ApiTicketType[];
  }>(`/organizer/${slug}/events/${eventId}/ticket-types`);

  return response.data.ticketTypes;
}

async function fetchOrganizerEventsWithTickets(
  slug: string,
): Promise<OrganizerWithTickets> {
  const organizerData = await fetchOrganizerEvents(slug);
  const organizer = organizerData.organizer;
  const events = organizerData.events.slice().sort((left, right) => {
    return new Date(left.date).getTime() - new Date(right.date).getTime();
  });

  const ticketTypeEntries = await Promise.all(
    events.map(async (event) => ({
      eventId: event._id,
      ticketTypes: await fetchEventTicketTypes(slug, event._id),
    })),
  );

  const ticketTypesByEventId = new Map(
    ticketTypeEntries.map((entry) => [entry.eventId, entry.ticketTypes]),
  );

  return {
    organizer: {
      ...organizer,
      heroTitle: "",
    },
    events: events.map((event) => ({
      ...event,
      ticketTypes: ticketTypesByEventId.get(event._id) ?? [],
    })),
  };
}

export async function getOrganizerOverview(
  slug: string,
): Promise<OrganizerProfile> {
  const [organizer, landing, organizerEventsWithTickets] = await Promise.all([
    fetchOrganizer(slug),
    fetchOrganizerLandingEvents(slug),
    fetchOrganizerEventsWithTickets(slug),
  ]);

  const eventsById = new Map(
    organizerEventsWithTickets.events.map((event) => [event._id, event]),
  );

  const featuredEvent = landing.featuredEvent
    ? eventsById.get(landing.featuredEvent._id) ?? {
        ...landing.featuredEvent,
        ticketTypes: [],
      }
    : null;

  const upcomingEvents = [
    ...(featuredEvent ? [featuredEvent] : []),
    ...landing.upcomingEvents
      .map((event) =>
        eventsById.get(event._id) ?? {
          ...event,
          ticketTypes: [],
        },
      )
      .filter((event) => event._id !== featuredEvent?._id),
  ].map((event) => mapEventCard(event, event.ticketTypes, slug));

  const pastEvents = landing.pastEvents.map((event) => {
    const eventWithTickets = eventsById.get(event._id) ?? {
      ...event,
      ticketTypes: [],
    };

    return mapPastEvent(eventWithTickets, eventWithTickets.ticketTypes);
  });

  const ticketsSold = organizerEventsWithTickets.events.reduce((sum, event) => {
    return (
      sum +
      event.ticketTypes.reduce(
        (eventSum, ticketType) => eventSum + ticketType.quantitySold,
        0,
      )
    );
  }, 0);

  return {
    id: organizer._id,
    slug: organizer.slug,
    name: organizer.name,
    logo: organizer.logoUrl,
    bannerUrl: organizer.bannerUrl,
    tagline: organizer.heroTitle || organizer.heroSubtitle || organizer.name,
    description: organizer.heroSubtitle || organizer.about,
    about: organizer.about,
    contactEmail: organizer.contactEmail,
    contactPhone: organizer.contactPhone,
    location: organizer.location,
    themeColor: "#9333ea",
    stats: {
      eventsCount: organizerEventsWithTickets.events.length,
      ticketsSold,
    },
    upcomingEvents,
    pastEvents,
    socialLinks: {},
  };
}

export async function getOrganizerEventsPageData(slug: string) {
  const organizerEventsWithTickets = await fetchOrganizerEventsWithTickets(slug);

  return organizerEventsWithTickets.events.map((event) =>
    mapEventCard(event, event.ticketTypes, slug),
  );
}

export async function getAllPublicEventsData(): Promise<AdminEventListItem[]> {
  const events = await fetchAllEvents();

  return events
    .slice()
    .sort(
      (left, right) =>
        new Date(left.date).getTime() - new Date(right.date).getTime(),
    )
    .map((event) => ({
      id: event._id,
      title: event.title,
      imageUrl: event.posterUrl,
      dateTimeText: formatDateTimeText(new Date(event.date)),
      locationText: event.location,
      organizerId: event.organizerId,
      organizerName:
        event.organizer?.name || event.organizerName || "Organizer",
      organizerSlug:
        event.organizer?.slug ||
        event.organizerSlug ||
        event.organizer_slug ||
        event.slug,
    }));
}

export async function getOrganizerEventDetails(
  slug: string,
  eventId: string,
): Promise<OrganizerEventDetailsData> {
  const [{ organizer, event }, ticketTypes] = await Promise.all([
    fetchOrganizerEvent(slug, eventId),
    fetchEventTicketTypes(slug, eventId),
  ]);

  const totalSold = ticketTypes.reduce(
    (sum, ticketType) => sum + ticketType.quantitySold,
    0,
  );

  return {
    organizer: {
      _id: organizer._id,
      name: organizer.name,
      slug: organizer.slug,
      heroTitle: "",
    },
    event: mapEventCard(event, ticketTypes, slug),
    totalSold,
  };
}

export async function getOrganizerDashboardData(
  slug: string,
): Promise<OrganizerDashboardData> {
  const [organizer, summaryResponse, organizerEventsWithTickets] =
    await Promise.all([
      fetchOrganizer(slug),
      apiFetch<{ summary: ApiDashboardSummary }>(
        `/organizer/dashboard/summary`,
        { auth: true },
      ),
      fetchOrganizerEventsWithTickets(slug),
    ]);

  const scannerSummaryEntries = await Promise.all(
    organizerEventsWithTickets.events.map(async (event) => {
      try {
        const scannerSummary = await getOrganizerScannerSummary(event._id);
        return [event._id, scannerSummary.scannerSummary] as const;
      } catch {
        return [event._id, null] as const;
      }
    }),
  );

  const scannerSummaryByEventId = new Map(scannerSummaryEntries);

  const events = organizerEventsWithTickets.events.map((event) => {
    const base = mapOrganizerEvent(event, event.ticketTypes);
    const scannerSummary = scannerSummaryByEventId.get(event._id);

    return {
      ...base,
      checkIns: scannerSummary?.totalCheckedIn ?? base.checkIns,
      checkInPercentage: scannerSummary?.checkInPercentage ?? 0,
    };
  });

  const totalCheckedIn = events.reduce((sum, event) => sum + event.checkIns, 0);
  const totalCheckInPercentage =
    summaryResponse.data.summary.totalTicketsSold > 0
      ? Math.min(
          100,
          Math.round(
            (totalCheckedIn / summaryResponse.data.summary.totalTicketsSold) *
              100,
          ),
        )
      : 0;

  const now = Date.now();
  const nextEvent =
    organizerEventsWithTickets.events.find(
      (event) => new Date(event.date).getTime() >= now,
    ) ?? organizerEventsWithTickets.events[0] ?? null;

  return {
    organizer: {
      _id: organizer._id,
      name: organizer.name,
      slug: organizer.slug,
    },
    events,
    totals: {
      activeEvents: summaryResponse.data.summary.totalEvents,
      ticketsSold: summaryResponse.data.summary.totalTicketsSold,
      revenue: summaryResponse.data.summary.totalRevenue,
      checkIns: totalCheckedIn,
      checkInPercentage: totalCheckInPercentage,
    },
    nextEvent: nextEvent
      ? events.find((event) => event.id === nextEvent._id) ??
        mapOrganizerEvent(nextEvent, nextEvent.ticketTypes)
      : null,
  };
}

export async function getOrganizerStaffWorkspaceData(
  slug: string,
): Promise<{
  organizer: Pick<ApiOrganizer, "_id" | "name" | "slug">;
  events: OrganizerEvent[];
  totals: {
    events: number;
    ticketsSold: number;
  };
}> {
  const organizerEventsWithTickets = await fetchOrganizerEventsWithTickets(slug);

  const events = organizerEventsWithTickets.events.map((event) =>
    mapOrganizerEvent(event, event.ticketTypes),
  );

  const ticketsSold = events.reduce((sum, event) => sum + event.capacitySold, 0);

  return {
    organizer: {
      _id: organizerEventsWithTickets.organizer._id,
      name: organizerEventsWithTickets.organizer.name,
      slug: organizerEventsWithTickets.organizer.slug,
    },
    events,
    totals: {
      events: events.length,
      ticketsSold,
    },
  };
}

export async function verifyTicketCode(ticketCode: string): Promise<ApiTicket> {
  const response = await apiFetch<{ ticket: ApiTicket }>(`/tickets/verify`, {
    method: "POST",
    body: JSON.stringify({ ticketCode }),
  });

  return response.data.ticket;
}

export async function createPurchase(
  slug: string,
  eventId: string,
  input: {
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    items: { ticketTypeId: string; quantity: number }[];
  },
): Promise<{ order: ApiOrder; items: ApiOrderItem[] }> {
  const response = await apiFetch<{
    order: ApiOrder;
    items: ApiOrderItem[];
  }>(`/organizer/${slug}/events/${eventId}/purchases`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function initializeOrderPayment(orderId: string): Promise<{
  order: ApiOrder;
  payment: ApiPaymentInitialization;
}> {
  const response = await apiFetch<{
    order: ApiOrder;
    payment: ApiPaymentInitialization;
  }>(`/orders/${orderId}/pay`, {
    method: "POST",
  });

  return response.data;
}

export async function getOrderTickets(orderId: string): Promise<{
  order: ApiOrder;
  tickets: ApiTicket[];
}> {
  const response = await apiFetch<{
    order: ApiOrder;
    tickets: ApiTicket[];
  }>(`/orders/${orderId}/tickets`);

  return response.data;
}

export async function getOrderByPaymentReference(
  paymentReference: string,
): Promise<{ order: ApiOrder }> {
  const response = await apiFetch<{
    order: ApiOrder;
  }>(`/orders/payment-reference/${encodeURIComponent(paymentReference)}`);

  return response.data;
}

export async function getOrderStatus(orderId: string): Promise<{
  orderStatus: ApiOrderStatus;
}> {
  const response = await apiFetch<{
    orderStatus: ApiOrderStatus;
  }>(`/orders/${orderId}/status`);

  return response.data;
}

export async function getOrganizerGalleryData(
  slug: string,
): Promise<OrganizerGalleryItem[]> {
  const gallery = await fetchOrganizerGallery(slug);

  return gallery
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map(mapGalleryItem);
}

export async function createOrganizerGalleryItem(
  input: {
    imageUrl: string;
    caption?: string;
    altText?: string;
    displayOrder?: number;
  },
) {
  const response = await apiFetch<{
    galleryItem: ApiGalleryItem;
  }>(`/organizer/dashboard/gallery`, {
    method: "POST",
    body: JSON.stringify(input),
    auth: true,
  });

  return response.data.galleryItem;
}

export async function loginDashboardUser(input: {
  email: string;
  password: string;
}) {
  const response = await fetch(resolveUrl(`/auth/login`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiAuthResponse | { message?: string };

  if (!response.ok || !("token" in payload)) {
    throw new Error(
      ("message" in payload && payload.message) || "Unable to sign in.",
    );
  }

  return payload;
}

export async function getOrganizerScannerSummary(eventId: string) {
  const response = await apiFetch<{
    event: { id: string; title: string; date: string; location: string };
    scannerSummary: ApiScannerSummary;
  }>(`/organizer/dashboard/events/${eventId}/scanner-summary`, {
    auth: true,
  });

  return response.data;
}

export async function getOrganizerEventAttendees(eventId: string) {
  const response = await apiFetch<{
    event: { id: string; title: string };
    attendees: ApiEventAttendee[];
  }>(`/organizer/dashboard/events/${eventId}/attendees`, {
    auth: true,
  });

  return response.data;
}

export async function createOrganizerDashboardEvent(input: {
  title: string;
  description: string;
  date: string;
  location: string;
  posterUrl: string;
  dressCode?: string;
  policies?: string;
}) {
  const response = await apiFetch<{
    event: ApiEvent;
  }>(`/organizer/dashboard/events`, {
    method: "POST",
    body: JSON.stringify(input),
    auth: true,
  });

  return response.data.event;
}

export async function createOrganizerDashboardTicketType(
  eventId: string,
  input: {
    name: string;
    description?: string;
    price: number;
    quantityAvailable: number;
    displayOrder?: number;
  },
) {
  const response = await apiFetch<{
    event: { id: string; title: string };
    ticketType: ApiTicketType;
  }>(`/organizer/dashboard/events/${eventId}/ticket-types`, {
    method: "POST",
    body: JSON.stringify(input),
    auth: true,
  });

  return response.data.ticketType;
}

export async function verifyDashboardTicket(
  eventId: string,
  ticketCode: string,
): Promise<ApiTicket> {
  const response = await apiFetch<{ ticket: ApiTicket }>(
    `/organizer/dashboard/events/${eventId}/verify-ticket`,
    {
      method: "POST",
      body: JSON.stringify({ ticketCode }),
      auth: true,
    },
  );

  return response.data.ticket;
}
