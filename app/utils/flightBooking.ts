// Helpers for the flight checkout: prebook -> pay -> book

import { formatMinutes } from "~/utils/flights";

export const flightBookingKey = (prebookId: string) =>
  `easyset_flight_booking_${prebookId}`;

// POST /flights/prebooks -> { data: [{ prebookId, transactionId, secretKey, price, currency }] }
export function toFlightPrebook(res: any) {
  const d = res?.data?.[0] ?? {};
  return {
    prebookId: String(d.prebookId ?? ""),
    transactionId: String(d.transactionId ?? ""),
    secretKey: String(d.secretKey ?? ""),
    price: Number.isFinite(Number(d.price)) ? Number(d.price) : null,
    currency: String(d.currency ?? "USD"),
  };
}
export type FlightPrebook = ReturnType<typeof toFlightPrebook>;

// "2026-07-02T16:10:00" -> "16:10" / "Thursday, 2 July" (local airport time, no timezone shift)
const clock = (iso?: string) => (iso ?? "").slice(11, 16);
const longDate = (iso?: string) =>
  /^\d{4}-\d{2}-\d{2}/.test(iso ?? "")
    ? new Date(`${iso!.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      })
    : "";

export interface TicketSegment {
  airline: string;
  logoUrl: string;
  code: string;
  cabin: string;
  duration: string;
  connecting: boolean; // continues the previous flight (same direction)
  from: { code: string; time: string; date: string; airport: string };
  to: { code: string; time: string; date: string; airport: string };
}

// POST /flights/bookings -> { data: [{ booking }] }
export function toFlightBooking(res: any) {
  const b = res?.data?.[0]?.booking ?? {};
  const segs: any[] = b.journey?.segments ?? [];
  const fares: any[] = b.journey?.segmentFares ?? [];

  const segments: TicketSegment[] = segs.map((s, i) => {
    const c = s.carrier ?? {};
    const logo = String(c.marketingLogo ?? "");
    const fare = fares.find((f) => f.segmentKey === s.segmentKey);
    const prev = segs[i - 1];
    return {
      airline:
        c.marketingName || c.operatingName || c.marketingCode || "Airline",
      logoUrl: /^https?:\/\//.test(logo) ? logo : "",
      code: `${c.marketingCode ?? ""} ${s.flight?.marketingNumber ?? ""}`.trim(),
      cabin: fare?.cabin || b.journey?.fare?.family || "Economy",
      duration: s.duration?.minutes ? formatMinutes(s.duration.minutes) : "",
      connecting: !!prev && prev.direction === s.direction,
      from: {
        code: s.originCode ?? "",
        time: clock(s.departureTime),
        date: longDate(s.departureTime),
        airport: s.originName ?? "",
      },
      to: {
        code: s.destinationCode ?? "",
        time: clock(s.arrivalTime),
        date: longDate(s.arrivalTime),
        airport: s.destinationName ?? "",
      },
    };
  });

  // Wait between a flight and the next one of the same direction ("4h 45m")
  const layovers = segs.map((s, i) => {
    const next = segs[i + 1];
    if (!next || next.direction !== s.direction) return null;
    const mins = Math.round(
      (Date.parse(next.departureTime) - Date.parse(s.arrivalTime)) / 60000,
    );
    return {
      airport: s.destinationName ?? s.destinationCode ?? "",
      duration: mins > 0 ? formatMinutes(mins) : "",
    };
  });

  const airlineRef = b.order?.reference?.airlineBookings?.[0];
  const out = segs.filter((s) => s.direction !== "INBOUND");
  const first = out[0] ?? segs[0];
  const last = out[out.length - 1] ?? segs[segs.length - 1];
  const back = segs.find((s) => s.direction === "INBOUND");
  const money = [
    b.pricing?.totalAmount,
    b.payment?.amount,
    b.order?.price?.total,
    b.journey?.pricing?.display?.total,
  ]
    .map(Number)
    .find((n) => Number.isFinite(n) && n > 0);
  return {
    bookingId: String(b.bookingId ?? ""),
    status: String(b.status ?? ""),
    cancelPending: !!b.cancelIntentAt,
    route:
      first && last ? `${first.originCode} \u2192 ${last.destinationCode}` : "",
    departDate: longDate(first?.departureTime),
    returnDate: longDate(back?.departureTime),
    price: money ?? null,
    currency: String(
      b.pricing?.currency || b.payment?.currency || b.order?.currency || "USD",
    ),
    refundable: !!b.journey?.terms?.refundable,
    pnr: String(
      airlineRef?.airlinePnr ||
        airlineRef?.pnr ||
        b.airlineLocators?.[0]?.airlinePnr ||
        "",
    ),
    segments,
    layovers,
    passengers: (b.passengers ?? []).map((p: any) =>
      [p.firstName, p.lastName].filter(Boolean).join(" "),
    ) as string[],
  };
}
export type FlightBooking = ReturnType<typeof toFlightBooking>;

// ---- cancellation (GET quote / POST cancel)
const amount = (v: any) =>
  Number.isFinite(Number(v?.display?.amount)) ? Number(v.display.amount) : null;

export function toFlightQuote(res: any) {
  const d = res?.data?.[0] ?? {};
  const itemised = (d.penalties ?? [])
    .map((p: any) => amount(p.pricing))
    .filter((n: any) => n !== null);
  const vouchers: number[] = (d.vouchers ?? [])
    .map((v: any) => amount(v.pricing))
    .filter((n: any) => n !== null);
  return {
    refund: amount(d.refund),
    penalty:
      amount(d.penalty) ??
      (itemised.length
        ? itemised.reduce((a: number, b: number) => a + b, 0)
        : null),
    currency: String(
      d.refund?.display?.currency ||
        d.penalty?.display?.currency ||
        d.penalties?.[0]?.pricing?.display?.currency ||
        "USD",
    ),
    isRefundable: d.isRefundable === true,
    destination: String(d.destination ?? ""),
    voucher: vouchers.length ? vouchers.reduce((a, b) => a + b, 0) : null,
  };
}
export type FlightQuote = ReturnType<typeof toFlightQuote>;

export function toFlightCancel(res: any) {
  const d = res?.data ?? {};
  return {
    // 202 = airline accepted the request but has not confirmed it yet: status is still CONFIRMED
    pending: d.status === "CONFIRMED",
    fee: Number.isFinite(Number(d.cancellation_fee))
      ? Number(d.cancellation_fee)
      : 0,
    refund: Number.isFinite(Number(d.refund_amount))
      ? Number(d.refund_amount)
      : 0,
    currency: String(d.currency || "USD"),
  };
}

// ---- booking ids are remembered per user in this browser (mock project: no database)
const listKey = (email: string) =>
  `easyset_flight_bookings_${email.toLowerCase()}`;

export function getRememberedFlights(email: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(listKey(email)) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function rememberFlight(email: string, bookingId: string) {
  if (!email || !bookingId) return;
  try {
    const ids = getRememberedFlights(email).filter((x) => x !== bookingId);
    localStorage.setItem(listKey(email), JSON.stringify([bookingId, ...ids]));
  } catch {
    /* storage blocked: the booking just won't show in the list */
  }
}

// LiteAPI status code -> text for customers
const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  PENDING_CONFIRMATION: "Pending confirmation",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  CANCELLED_WITH_CHARGES: "Cancelled",
};
export const flightStatusLabel = (status: string) =>
  STATUS_LABELS[status] ?? status;
