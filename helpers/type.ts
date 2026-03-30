export interface menuDataProps {
  menuData: { name: string; href: string }[];
}

export type ApiEnvelope<T> = {
  status: string;
  data: T;
  results?: number;
  message?: string;
};

export type ApiAuthResponse = {
  status: string;
  token: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      role: "organizer" | "staff";
      organizerId: string;
      organizerSlug: string;
    };
  };
};

export type ApiOrganizer = {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  paystackSubaccountCode: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiEvent = {
  _id: string;
  organizerId: string;
  title: string;
  description: string;
  location: string;
  posterUrl: string;
  dressCode?: string;
  policies?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiTicketType = {
  _id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiGalleryItem = {
  _id: string;
  organizerId: string;
  imageUrl: string;
  caption: string;
  altText: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiTicket = {
  _id?: string;
  id?: string;
  ticketCode: string;
  status: "valid" | "checked-in";
  eventId: string;
  ticketTypeId: string;
  orderId?: string;
  buyerName: string;
  buyerEmail: string;
};

export type ApiOrder = {
  id: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "cancelled";
  paymentReference?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiOrderItem = {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type ApiPaymentInitialization = {
  provider: "paystack";
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type ApiDashboardSummary = {
  totalEvents: number;
  totalOrders: number;
  totalTicketsSold: number;
  totalRevenue: number;
};

export type ApiDashboardEventStat = {
  id: string;
  title: string;
  date: string;
  location: string;
  ticketsSold: number;
  revenue: number;
  totalOrders: number;
};

export type ApiScannerSummary = {
  totalTicketsSold: number;
  totalCheckedIn: number;
  totalUnchecked: number;
  checkInPercentage: number;
};

export type TicketType = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sold?: number;
  remaining: number;
  total: number;
  isActive?: boolean;
  buyHref?: string;
  buttonLabel?: string;
};

export type EventCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  dateTimeText: string;
  locationText: string;
  dressCode?: string;
  policies?: string[];
  ticketTypes: TicketType[];
};

export type OrganizerStats = {
  eventsCount: number;
  ticketsSold: number;
};

export type OrganizerPastEvent = {
  id: string;
  title: string;
  dateText: string;
  ticketsSold: number;
  imageUrl: string;
};

export type OrganizerSocialLinks = {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
};

export type OrganizerProfile = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  bannerUrl: string;
  tagline: string;
  description: string;
  about: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  themeColor: string;
  stats: OrganizerStats;
  upcomingEvents: EventCardProps[];
  pastEvents: OrganizerPastEvent[];
  socialLinks: OrganizerSocialLinks;
};

export type TicketTypeBreak = {
  id: string;
  name: string;
  price: number;
  sold: number;
  total: number;
};

export type OrganizerEvent = {
  id: string;
  title: string;
  dateTimeText: string;
  capacitySold: number;
  capacityTotal: number;
  revenue: number;
  checkIns: number;
  ticketTypesCount: number;
  ticketTypes: TicketTypeBreak[];
};

export type OrganizerDashboardData = {
  organizer: Pick<ApiOrganizer, "_id" | "name" | "slug">;
  events: OrganizerEvent[];
  totals: {
    activeEvents: number;
    ticketsSold: number;
    revenue: number;
    checkIns: number;
  };
  nextEvent: OrganizerEvent | null;
};

export type OrganizerEventDetailsData = {
  organizer: Pick<ApiOrganizer, "_id" | "name" | "slug" | "heroTitle">;
  event: EventCardProps;
  totalSold: number;
};

export type OrganizerGalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  altText: string;
  dateText: string;
};

export type AdminEventListItem = {
  id: string;
  title: string;
  imageUrl: string;
  dateTimeText: string;
  locationText: string;
  organizerId: string;
  organizerName: string;
  slug?: string;
};
