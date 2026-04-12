import { formatDateText, formatDateTimeText } from "@/helpers/date";
import { apiFetch, resolveUrl } from "@/helpers/api";
import type { OrderAccessContext } from "@/helpers/order-access";
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
  ApiPagination,
  ApiScannerSummary,
  ApiStaffSession,
  ApiSettlementEvent,
  ApiSettlementOrder,
  ApiSettlementSummary,
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
  organizerId?:
    | string
    | {
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

function pickDefinedString(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function isValidDateInput(value?: string) {
  if (!value?.trim()) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function mergeEventDetails(primary: ApiEvent, fallback?: ApiEvent): ApiEvent {
  if (!fallback) return primary;

  return {
    ...fallback,
    ...primary,
    title: pickDefinedString(primary.title, fallback.title) || "",
    description: pickDefinedString(primary.description, fallback.description) || "",
    location: pickDefinedString(primary.location, fallback.location) || "",
    posterUrl: pickDefinedString(primary.posterUrl, fallback.posterUrl),
    imageUrl: pickDefinedString(primary.imageUrl, fallback.imageUrl),
    dressCode: pickDefinedString(primary.dressCode, fallback.dressCode),
    policies: pickDefinedString(primary.policies, fallback.policies),
    date: isValidDateInput(primary.date) ? primary.date : fallback.date,
  };
}

function parsePolicies(value?: string) {
  if (!value) return [] as string[];

  const parts = value
    .split(/\r?\n|[;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [value];
}

function getEventImageUrl(event: Pick<ApiEvent, "posterUrl" | "imageUrl" | "title">) {
  const candidate = event.posterUrl?.trim() || event.imageUrl?.trim();

  if (candidate) {
    return candidate;
  }

  const title = encodeURIComponent(event.title || "Event");
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="%23ede9fe"/><rect x="60" y="60" width="1080" height="680" rx="36" fill="%23c4b5fd"/><text x="50%25" y="48%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" fill="%233b0764">Event Image</text><text x="50%25" y="58%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="%235b21b6">${title}</text></svg>`;
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
  const quantityReserved =
    typeof ticketType.quantityReserved === "number"
      ? ticketType.quantityReserved
      : 0;

  return {
    id: ticketType._id,
    name: titleCase(ticketType.name),
    description: ticketType.description || undefined,
    price: ticketType.price,
    sold: ticketType.quantitySold,
    remaining: Math.max(
      0,
      ticketType.quantityAvailable -
        ticketType.quantitySold -
        quantityReserved,
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
    imageUrl: getEventImageUrl(event),
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
    imageUrl: getEventImageUrl(event),
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

async function fetchPublicOrganizers() {
  const response = await apiFetch<{ organizers: ApiOrganizer[] }>(
    `/organizer`,
  );

  return response.data.organizers;
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
    organizer: Pick<ApiOrganizer, "name" | "slug"> & { _id?: string };
    event: ApiEvent;
    ticketTypes?: ApiTicketType[];
  }>(`/organizer/${slug}/events/${eventId}`);

  return {
    ...response.data,
    ticketTypes: response.data.ticketTypes ?? [],
  };
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

function getOrderAccessHeaders(access?: OrderAccessContext) {
  const headers: Record<string, string> = {};

  const accessToken = access?.accessToken?.trim();
  if (accessToken) {
    headers["x-order-access-token"] = accessToken;
    return headers;
  }

  const buyerEmail = access?.buyerEmail?.trim();
  if (buyerEmail) {
    headers["x-buyer-email"] = buyerEmail;
  }

  return headers;
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
    id: organizer._id ?? organizer.slug,
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

export async function getPublicOrganizers(): Promise<ApiOrganizer[]> {
  const organizers = await fetchPublicOrganizers();

  return organizers
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name));
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
      imageUrl: getEventImageUrl(event),
      dateTimeText: formatDateTimeText(new Date(event.date)),
      locationText: event.location,
      organizerId:
        typeof event.organizerId === "string"
          ? event.organizerId
          : event.organizerId?._id || event.organizerId?.id || "",
      organizerName: 
        event.organizer?.name || 
        (typeof event.organizerId === "object" ? event.organizerId?.name : "") || 
        event.organizerName || 
        titleCase(
          event.organizerSlug ||
            event.organizer_slug ||
            event.slug ||
            "Organizer",
        ), 
      organizerSlug:
        event.organizer?.slug ||
        (typeof event.organizerId === "object"
          ? event.organizerId?.slug
          : undefined) ||
        event.organizerSlug ||
        event.organizer_slug ||
        event.slug,
    }));
}

export async function getOrganizerEventDetails(
  slug: string,
  eventId: string,
): Promise<OrganizerEventDetailsData> {
  const [{ organizer, event, ticketTypes }, organizerEventsData] = await Promise.all([
    fetchOrganizerEvent(slug, eventId),
    fetchOrganizerEvents(slug).catch(() => null),
  ]);

  const fallbackEvent = organizerEventsData?.events.find(
    (candidate) => candidate._id === eventId,
  );
  const resolvedEvent = mergeEventDetails(event, fallbackEvent);
  const resolvedTicketTypes =
    ticketTypes.length > 0
      ? ticketTypes
      : await fetchEventTicketTypes(slug, eventId).catch(() => []);

  const totalSold = resolvedTicketTypes.reduce(
    (sum, ticketType) => sum + ticketType.quantitySold,
    0,
  );

  return {
    organizer: {
      _id: organizer._id ?? "",
      name: organizer.name,
      slug: organizer.slug,
      heroTitle: "",
    },
    event: mapEventCard(resolvedEvent, resolvedTicketTypes, slug),
    totalSold,
    ticketTypeBreakdown: resolvedTicketTypes
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(mapTicketBreak),
  };
}

export async function getOrganizerDashboardData(
  slug: string,
): Promise<OrganizerDashboardData> {
  const [organizer, summaryResponse, organizerEventsWithTickets, settlementData] =
    await Promise.all([
      fetchOrganizer(slug),
      apiFetch<{ summary: ApiDashboardSummary }>(
        `/organizer/dashboard/summary`,
        { auth: true },
      ),
      fetchOrganizerEventsWithTickets(slug),
      getOrganizerOverallSettlementSummary().catch(() => null),
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
      confirmedSales:
        settlementData?.summary.confirmedSales ??
        summaryResponse.data.summary.totalRevenue,
      pendingSettlement: settlementData?.summary.pendingSettlement ?? 0,
      settledRevenue:
        settlementData?.summary.settled ??
        summaryResponse.data.summary.totalRevenue,
      platformFees: settlementData?.summary.platformFees ?? 0,
      paymentProcessingFees:
        settlementData?.summary.paymentProcessingFees ?? 0,
      expectedNetSettlement:
        settlementData?.summary.expectedNetSettlement ??
        summaryResponse.data.summary.totalRevenue,
      totalPaidOrders: settlementData?.summary.totalPaidOrders ?? 0,
      totalEventsWithSales: settlementData?.summary.totalEventsWithSales ?? 0,
    },
    nextEvent: nextEvent
      ? events.find((event) => event.id === nextEvent._id) ??
        mapOrganizerEvent(nextEvent, nextEvent.ticketTypes)
      : null,
    settlementEvents: settlementData?.events ?? [],
    recentSettlementOrders: settlementData?.recentOrders ?? [],
  };
}

export async function syncOrganizerSettlements() {
  const response = await apiFetch<{
    settlementsChecked: number;
    transactionsChecked: number;
    ordersUpdated: number;
    unmatchedTransactions: Array<{
      settlementId: number;
      reference: string;
      transactionId: string;
      amount: number;
    }>;
  }>(`/organizer/dashboard/sync-settlements`, {
    method: "POST",
    auth: true,
  });

  return response.data;
}

export async function getOrganizerOverallSettlementSummary(
  page = 1,
  perPage = 20,
): Promise<{
  summary: ApiSettlementSummary;
  events: ApiSettlementEvent[];
  pagination: ApiPagination;
  recentOrders: ApiSettlementOrder[];
}> {
  const response = await apiFetch<{
    summary: ApiSettlementSummary;
    events: ApiSettlementEvent[];
    pagination: ApiPagination;
    recentOrders: ApiSettlementOrder[];
  }>(`/organizer/dashboard/overall-settlement-summary?page=${page}&perPage=${perPage}`, {
    auth: true,
  });

  return response.data;
}

export async function getOrganizerEventSettlementSummary(
  eventId: string,
  page = 1,
  perPage = 20,
): Promise<{
  event: { id: string; title: string; date: string; location: string };
  summary: ApiSettlementSummary;
  pagination: ApiPagination;
  orders: ApiSettlementOrder[];
}> {
  const response = await apiFetch<{
    event: { id: string; title: string; date: string; location: string };
    summary: ApiSettlementSummary;
    pagination: ApiPagination;
    orders: ApiSettlementOrder[];
  }>(
    `/organizer/dashboard/events/${eventId}/settlement-summary?page=${page}&perPage=${perPage}`,
    {
      auth: true,
    },
  );

  return response.data;
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
    buyerPhone: string;
    paymentGateway?: "squad";
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

export async function getOrderTickets(
  orderId: string,
  access?: OrderAccessContext,
): Promise<{
  order: ApiOrder;
  tickets: ApiTicket[];
}> {
  const response = await apiFetch<{
    order: ApiOrder;
    tickets: ApiTicket[];
  }>(`/orders/${orderId}/tickets`, {
    headers: getOrderAccessHeaders(access),
  });

  return response.data;
}

export async function getOrderByPaymentReference(
  paymentReference: string,
  access?: OrderAccessContext,
): Promise<{ order: ApiOrder }> {
  const response = await apiFetch<{
    order: ApiOrder;
  }>(`/orders/payment-reference/${encodeURIComponent(paymentReference)}`, {
    headers: getOrderAccessHeaders(access),
  });

  return response.data;
}

export async function getOrderStatus(
  orderId: string,
  access?: OrderAccessContext,
): Promise<{
  orderStatus: ApiOrderStatus;
}> {
  const response = await apiFetch<{
    orderStatus: ApiOrderStatus;
  }>(`/orders/${orderId}/status`, {
    headers: getOrderAccessHeaders(access),
  });

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
  deviceName?: string;
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

export async function logoutDashboardUser() {
  const response = await apiFetch<Record<string, never>>(`/auth/logout`, {
    method: "POST",
    auth: true,
  });

  return response;
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

export async function getStaffSessions(staffId: string): Promise<{
  sessions: ApiStaffSession[];
}> {
  const response = await apiFetch<{
    sessions: ApiStaffSession[];
  }>(`/organizer/dashboard/staff/${staffId}/sessions`, {
    auth: true,
  });

  return {
    sessions: response.data.sessions ?? [],
  };
}

export async function logoutStaffSession(
  staffId: string,
  sessionId: string,
) {
  const response = await apiFetch<Record<string, never>>(
    `/organizer/dashboard/staff/${staffId}/sessions/${sessionId}/logout`,
    {
      method: "PATCH",
      auth: true,
    },
  );

  return response;
}

export async function logoutAllStaffSessions(staffId: string) {
  const response = await apiFetch<Record<string, never>>(
    `/organizer/dashboard/staff/${staffId}/logout-all`,
    {
      method: "PATCH",
      auth: true,
    },
  );

  return response;
}
