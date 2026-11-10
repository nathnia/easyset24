// Helpers for the checkout flow: prebook -> pay -> book

const num = (v: any): number | undefined =>
  typeof v === "number"
    ? v
    : typeof v?.amount === "number"
      ? v.amount
      : undefined;

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

function cancelInfo(c: any) {
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

// POST /rates/prebook response
export function toPrebook(res: any) {
  const d = res?.data ?? {};
  const rates: any[] = d.roomTypes?.[0]?.rates ?? [];
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

// POST /rates/book response
export function toBooking(res: any) {
  const d = res?.data ?? {};
  const rooms: any[] = d.bookedRooms ?? [];
  const sum = (k: string) =>
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

// Booking ids are remembered per user in this browser (mock project: no database).
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
  } catch {
    /* storage blocked: the booking just won't show in the list */
  }
}

// Extra fields only present on a cancelled booking (names guessed, all optional)
export function toCancelInfo(res: any) {
  const d = res?.data ?? {};
  const fee = num(d.cancellation_fee ?? d.cancellationFee);
  const refund = num(d.refund_amount ?? d.refundAmount);
  return { fee, refund };
}
