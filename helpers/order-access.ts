export type OrderAccessContext = {
  accessToken?: string;
  buyerEmail?: string;
};

type StoredOrderSnapshot = {
  id?: string;
  eventId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  totalAmount?: number;
  paymentStatus?: string;
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
};

const STORAGE_KEYS = {
  orderId: "zentry:lastOrderId",
  organizerSlug: "zentry:lastOrganizerSlug",
  eventId: "zentry:lastEventId",
  paymentReference: "zentry:lastPaymentReference",
  orderAccessToken: "zentry:lastOrderAccessToken",
  buyerEmail: "zentry:lastBuyerEmail",
  orderSnapshot: "zentry:lastOrderSnapshot",
} as const;

function canUseSessionStorage() {
  return typeof window !== "undefined";
}

function readValue(key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]) {
  if (!canUseSessionStorage()) return "";
  return sessionStorage.getItem(key) || "";
}

function writeValue(
  key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS],
  value?: string | null,
) {
  if (!canUseSessionStorage()) return;

  const trimmedValue = value?.trim();
  if (trimmedValue) {
    sessionStorage.setItem(key, trimmedValue);
    return;
  }

  sessionStorage.removeItem(key);
}

export function getStoredOrderAccessContext(): OrderAccessContext {
  return {
    accessToken: readValue(STORAGE_KEYS.orderAccessToken),
    buyerEmail: readValue(STORAGE_KEYS.buyerEmail),
  };
}

export function storeOrderAccessContext(context: {
  orderId?: string;
  organizerSlug?: string;
  eventId?: string;
  paymentReference?: string;
  accessToken?: string;
  buyerEmail?: string;
  orderSnapshot?: StoredOrderSnapshot;
}) {
  writeValue(STORAGE_KEYS.orderId, context.orderId);
  writeValue(STORAGE_KEYS.organizerSlug, context.organizerSlug);
  writeValue(STORAGE_KEYS.eventId, context.eventId);
  writeValue(STORAGE_KEYS.paymentReference, context.paymentReference);
  writeValue(STORAGE_KEYS.orderAccessToken, context.accessToken);
  writeValue(STORAGE_KEYS.buyerEmail, context.buyerEmail);

  if (!canUseSessionStorage()) return;

  if (context.orderSnapshot) {
    sessionStorage.setItem(
      STORAGE_KEYS.orderSnapshot,
      JSON.stringify(context.orderSnapshot),
    );
  }
}

export function getStoredCheckoutContext() {
  let orderSnapshot: StoredOrderSnapshot | null = null;

  if (canUseSessionStorage()) {
    const raw = sessionStorage.getItem(STORAGE_KEYS.orderSnapshot);
    if (raw) {
      try {
        orderSnapshot = JSON.parse(raw) as StoredOrderSnapshot;
      } catch {
        sessionStorage.removeItem(STORAGE_KEYS.orderSnapshot);
      }
    }
  }

  return {
    orderId: readValue(STORAGE_KEYS.orderId),
    organizerSlug: readValue(STORAGE_KEYS.organizerSlug),
    eventId: readValue(STORAGE_KEYS.eventId),
    paymentReference: readValue(STORAGE_KEYS.paymentReference),
    orderSnapshot,
    ...getStoredOrderAccessContext(),
  };
}
