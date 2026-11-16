interface RawPolicies {
  refundableTag?: string;
  cancelPolicyInfos?: { cancelTime?: unknown }[];
  hotelRemarks?: unknown;
}
interface RawRate {
  name?: string;
  boardName?: string;
  cancellationPolicies?: RawPolicies;
}
interface RawPrebook {
  prebookId?: string;
  transactionId?: string;
  secretKey?: string;
  currency?: string;
  price?: unknown;
  suggestedSellingPrice?: unknown;
  priceDifferencePercent?: number | string;
  cancellationChanged?: boolean;
  boardChanged?: boolean;
  cancellationPolicies?: RawPolicies;
  roomTypes?: { rates?: RawRate[] }[];
}
interface RawBookedRoom {
  adults?: number | string;
  children?: number | string;
  boardName?: string;
  roomType?: { name?: string };
}
interface RawBooking {
  bookingId?: string | number;
  status?: string;
  hotelConfirmationCode?: string;
  hotel?: { hotelId?: string; name?: string };
  checkin?: string;
  checkout?: string;
  bookedRooms?: RawBookedRoom[];
  price?: unknown;
  currency?: string;
  cancellationPolicies?: RawPolicies;
  holder?: { firstName?: string; lastName?: string; email?: string };
}
interface RawCancelInfo {
  cancellation_fee?: unknown;
  cancellationFee?: unknown;
  refund_amount?: unknown;
  refundAmount?: unknown;
}

const num = (v: unknown): number | undefined => {
  if (typeof v === "number") return v;
  const a = (v as { amount?: unknown } | null)?.amount;
  return typeof a === "number" ? a : undefined;
};

const DAY = 86400000;

export const checkoutKey = (prebookId: string) =>
  `easyset_checkout_${prebookId}`;
export const bookingKey = (prebookId: string) => `easyset_booking_${prebookId}`;

export function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
}

export const nightsBetween = (a?: string, b?: string) =>
  a && b ? Math.max(Math.round((Date.parse(b) - Date.parse(a)) / DAY), 0) : 0;

function cancelInfo(c?: RawPolicies) {
  const time = c?.cancelPolicyInfos?.[0]?.cancelTime;
  return {
    refundable: c?.refundableTag === "RFN",
    cancelUntil: typeof time === "string" ? time.slice(0, 10) : "",
  };
}

export const cancelText = (o: { refundable: boolean; cancelUntil: string }) =>
  !o.refundable
    ? "Non-refundable"
    : o.cancelUntil
      ? "Free cancellation until " + formatDate(o.cancelUntil)
      : "Free cancellation";

export function toPrebook(res: unknown) {
  const d: RawPrebook = (res as { data?: RawPrebook } | null)?.data ?? {};
  const rates = d.roomTypes?.[0]?.rates ?? [];
  const first = rates[0];
  return {
    prebookId: String(d.prebookId ?? ""),
    transactionId: String(d.transactionId ?? ""),
    secretKey: String(d.secretKey ?? ""),
    currency: String(d.currency ?? "USD"),
    price: num(d.price) ?? num(d.suggestedSellingPrice),
    roomName: String(first?.name ?? "Room"),
    board: String(first?.boardName || "Room only"),
    rooms: rates.length || 1,
    ...cancelInfo(first?.cancellationPolicies ?? d.cancellationPolicies),
    priceDifferencePercent: Number(d.priceDifferencePercent) || 0,
    cancellationChanged: !!d.cancellationChanged,
    boardChanged: !!d.boardChanged,
  };
}
export type Prebook = ReturnType<typeof toPrebook>;

export function toBooking(res: unknown) {
  const d: RawBooking = (res as { data?: RawBooking } | null)?.data ?? {};
  const rooms = d.bookedRooms ?? [];
  const sum = (k: "adults" | "children") =>
    rooms.reduce((a, r) => a + (Number(r?.[k]) || 0), 0);
  const remarks = d.cancellationPolicies?.hotelRemarks;
  return {
    bookingId: String(d.bookingId ?? ""),
    status: String(d.status ?? ""),
    confirmationCode: String(d.hotelConfirmationCode ?? ""),
    hotelId: String(d.hotel?.hotelId ?? ""),
    hotelName: String(d.hotel?.name ?? ""),
    checkin: String(d.checkin ?? ""),
    checkout: String(d.checkout ?? ""),
    rooms: rooms.length || 1,
    roomName: String(rooms[0]?.roomType?.name ?? ""),
    board: String(rooms[0]?.boardName ?? ""),
    adults: sum("adults"),
    children: sum("children"),
    price: num(d.price),
    currency: String(d.currency ?? "USD"),
    ...cancelInfo(d.cancellationPolicies),
    hotelRemarks: (Array.isArray(remarks) ? remarks : []).filter(
      (r: unknown): r is string => typeof r === "string" && !!r,
    ),
    holder: [d.holder?.firstName, d.holder?.lastName].filter(Boolean).join(" "),
    email: String(d.holder?.email ?? ""),
  };
}
export type Booking = ReturnType<typeof toBooking>;

const listKey = (email: string) => `easyset_bookings_${email.toLowerCase()}`;

export function getRememberedBookings(email: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(listKey(email)) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function rememberBooking(email: string, bookingId: string) {
  if (!email || !bookingId) return;
  try {
    const ids = getRememberedBookings(email).filter((x) => x !== bookingId);
    localStorage.setItem(listKey(email), JSON.stringify([bookingId, ...ids]));
  } catch {}
}

export function toCancelInfo(res: unknown) {
  const d: RawCancelInfo = (res as { data?: RawCancelInfo } | null)?.data ?? {};
  const fee = num(d.cancellation_fee ?? d.cancellationFee);
  const refund = num(d.refund_amount ?? d.refundAmount);
  return { fee, refund };
}
