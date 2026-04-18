export interface menuDataProps { 
  menuData: { name: string; href: string }[]; 
} 

export interface mobileMenuProps extends menuDataProps {
  showLogin?: boolean;
  loginHref?: string;
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
    session: {
      id: string;
      deviceName?: string;
      userAgent?: string;
    };
  };
};

export type ApiAdminAuthResponse = {
  status: string;
  token: string;
  data: {
    admin: {
      id: string;
      fullName: string;
      email: string;
      isActive?: boolean;
    };
    session: {
      id: string;
      deviceName?: string;
      userAgent?: string;
    };
  };
};

export type ApiAdminAnalytics = {
  organizers: {
    total: number;
    active: number;
    inactive: number;
  };
  events: {
    total: number;
    upcoming: number;
    completed: number;
  };
  orders: {
    totalPaidOrders: number;
    grossRevenue: number;
  };
  tickets: {
    totalIssued: number;
    totalCheckedIn: number;
  };
  revenue: {
    platformFees: number;
  };
};

export type ApiAdminOrganizerSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalEvents: number;
    totalPaidOrders: number;
    totalTicketsSold: number;
    grossRevenue: number;
  };
};

export type ApiAdminOrganizerDetail = {
  organizer: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    bannerUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    about?: string;
    contactEmail?: string;
    contactPhone?: string;
    location?: string;
    bankDetails?: ApiBankDetails;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    totalEvents: number;
    totalPaidOrders: number;
    grossRevenue: number;
    platformFees: number;
    totalTicketsSold: number;
    totalCheckedInTickets: number;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    createdAt: string;
  }>;
};

export type ApiAdminOrderSummary = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  paymentReference?: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "cancelled";
  paidAt?: string;
  platformFeeTotal?: number;
  squadGatewayFee?: number;
  squadTransferFee?: number;
  organizerPayoutAmount?: number;
  settlementStatus?: "pending" | "processing" | "settled" | "failed";
  settlementBatchId?: string;
  settlementDate?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  organizer: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ApiAdminOrderDetail = {
  order: {
    id: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    paymentReference?: string;
    totalAmount: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    paidAt?: string;
    platformFeeTotal?: number;
    squadGatewayFee?: number;
    squadTransferFee?: number;
    organizerPayoutAmount?: number;
    settlementStatus?: "pending" | "processing" | "settled" | "failed";
    settlementBatchId?: string;
    settlementDate?: string | null;
    createdAt: string;
    updatedAt: string;
    event: {
      id: string;
      title: string;
      date: string;
      location: string;
    };
    organizer: {
      id: string;
      name: string;
      slug: string;
    };
    items: Array<{
      id: string;
      ticketTypeId: string;
      ticketTypeName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }>;
  };
};

export type ApiAdminEventSummary = {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  posterUrl?: string;
  dressCode?: string;
  policies?: string;
  createdAt: string;
  isUpcoming: boolean;
  organizer: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  stats: {
    totalPaidOrders: number;
    totalTicketsSold: number;
    totalCheckedInTickets: number;
    grossRevenue: number;
    platformFees: number;
  };
};

export type ApiAdminEventDetail = {
  event: {
    id: string;
    title: string;
    description?: string;
    date: string;
    location: string;
    posterUrl?: string;
    dressCode?: string;
    policies?: string;
    createdAt: string;
    updatedAt: string;
    isUpcoming: boolean;
    organizer: {
      id: string;
      name: string;
      slug: string;
      contactEmail?: string;
      contactPhone?: string;
      isActive: boolean;
    };
  };
  stats: {
    totalPaidOrders: number;
    grossRevenue: number;
    platformFees: number;
    squadGatewayFees?: number;
    squadTransferFees?: number;
    organizerPayoutAmount: number;
    totalTicketsSold: number;
    totalCheckedInTickets: number;
  };
  recentOrders: Array<{
    id: string;
    buyerName: string;
    buyerEmail: string;
    paymentReference?: string;
    totalAmount: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    settlementStatus?: "pending" | "processing" | "settled" | "failed";
    paidAt?: string;
    createdAt: string;
  }>;
};

export type ApiAdminTicketSummary = {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  buyerName: string;
  buyerEmail: string;
  ticketCode: string;
  status: "valid" | "checked-in";
  checkedInAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  organizer: {
    id: string;
    name: string;
    slug: string;
  };
};

export type ApiAdminTicketDetail = {
  ticket: {
    id: string;
    orderId: string;
    eventId: string;
    ticketTypeId: string;
    buyerName: string;
    buyerEmail: string;
    ticketCode: string;
    status: "valid" | "checked-in";
    checkedInAt?: string | null;
    verifiedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    event: {
      id: string;
      title: string;
      date: string;
      location: string;
    };
    organizer: {
      id: string;
      name: string;
      slug: string;
    };
    verifiedUser?: {
      id: string;
      fullName: string;
      email: string;
      role: "organizer" | "staff";
    } | null;
  };
};

export type ApiAdminCreatedUser = {
  id: string;
  organizerId: string;
  fullName: string;
  email: string;
  role: "organizer" | "staff";
  isActive: boolean;
};

export type ApiOrganizerRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  about: string;
  location: string;
  preferredSlug: string;
  logoUrl: string;
  bannerUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  bankDetails?: ApiBankDetails;
  status: "pending" | "approved" | "rejected";
  reviewNote: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdOrganizerId?: string | null;
  createdDashboardUserId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiOrganizerRequestApproval = {
  organizer: {
    id: string;
    name: string;
    slug: string;
    contactEmail: string;
    isActive: boolean;
  };
  dashboardUser: {
    id: string;
    organizerId: string;
    fullName: string;
    email: string;
    role: "organizer";
    isActive: boolean;
  };
  temporaryPassword: string;
};

export type ApiBankDetails = {
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
};

export type ApiOrganizer = {
  _id?: string;
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
  isActive?: boolean;
  staffSessionLimit?: number;
  organizerSessionLimit?: number;
  paystackSubaccountCode?: string;
  bankDetails?: ApiBankDetails;
  createdAt: string;
  updatedAt: string;
};

export type ApiEvent = {
  _id: string;
  eventId?: string;
  organizerId:
    | string
    | {
        _id: string;
        slug?: string;
        name?: string;
      };
  organizerSlug?: string;
  title: string;
  description: string;
  location: string;
  posterUrl?: string;
  imageUrl?: string;
  dressCode?: string;
  policies?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiTicketType = {
  _id: string;
  eventId?: string;
  name: string;
  description?: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  quantityReserved?: number;
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
  eventId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "cancelled";
  paymentGateway?: "squad";
  paymentReference?: string | null;
  accessToken?: string;
  reservationExpiresAt?: string | null;
  reservationReleasedAt?: string | null;
  platformFeeTotal?: number;
  squadGatewayFee?: number;
  squadTransferFee?: number;
  organizerPayoutAmount?: number;
  checkoutUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiOrderStatus = {
  orderId: string;
  paymentStatus: "pending" | "paid" | "cancelled";
  paymentGateway?: "squad";
  paymentReference?: string | null;
  totalAmount: number;
  isPaid: boolean;
  reservationExpiresAt?: string | null;
  createdAt?: string;
};

export type ApiOrderItem = {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type ApiDashboardSummary = {
  totalEvents: number;
  totalOrders: number;
  totalTicketsSold: number;
  totalRevenue: number;
};

export type ApiDashboardUser = {
  id: string;
  organizerId: string;
  fullName: string;
  email: string;
  role: "organizer" | "staff";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export type ApiSettlementSummary = {
  confirmedSales: number;
  platformFees: number;
  squadGatewayFees: number;
  squadTransferFees: number;
  organizerPayoutAmount: number;
  totalPaidOrders: number;
  pendingSettlement: number;
  settled: number;
  totalEventsWithSales?: number;
};

export type ApiSettlementOrder = {
  id: string;
  eventId?: string;
  eventTitle?: string;
  buyerName: string;
  buyerEmail: string;
  paymentReference: string;
  grossAmount: number;
  platformFeeTotal: number;
  squadGatewayFee: number;
  squadTransferFee: number;
  organizerPayoutAmount: number;
  settlementStatus: "pending" | "processing" | "settled" | "failed";
  paidAt?: string;
  settlementDate?: string | null;
};

export type ApiSettlementEvent = {
  eventId: string;
  title: string;
  date: string;
  location: string;
  confirmedSales: number;
  pendingSettlement: number;
  settled: number;
  platformFees: number;
  squadGatewayFees: number;
  squadTransferFees: number;
  organizerPayoutAmount: number;
  totalPaidOrders: number;
};

export type ApiPagination = {
  page: number;
  perPage: number;
  totalOrders?: number;
  totalPages: number;
  total?: number;
};

export type ApiEventAttendee = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  ticketCode: string;
  status: "valid" | "checked-in";
  ticketType: string;
  purchasedAt: string;
};

export type ApiStaffSession = {
  id: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  lastActivityAt?: string;
  createdAt?: string;
  isActive?: boolean;
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
  checkInPercentage: number;
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
    checkInPercentage: number;
    confirmedSales: number;
    pendingSettlement: number;
    settledRevenue: number;
    platformFees: number;
    squadGatewayFees: number;
    squadTransferFees: number;
    organizerPayoutAmount: number;
    totalPaidOrders: number;
    totalEventsWithSales: number;
  };
  nextEvent: OrganizerEvent | null;
  settlementEvents: ApiSettlementEvent[];
  recentSettlementOrders: ApiSettlementOrder[];
};

export type OrganizerEventDetailsData = {
  organizer: Pick<ApiOrganizer, "_id" | "name" | "slug" | "heroTitle">;
  event: EventCardProps;
  totalSold: number;
  ticketTypeBreakdown: TicketTypeBreak[];
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
  organizerSlug?: string;
};
