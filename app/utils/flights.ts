export const CABIN_OPTIONS = [
  { label: "Economy", value: "ECONOMY" },
  { label: "Premium Economy", value: "PREMIUM_ECONOMY" },
  { label: "Business", value: "BUSINESS" },
  { label: "First", value: "FIRST" },
];
export const cabinLabel = (value: string) =>
  CABIN_OPTIONS.find((o) => o.value === value)?.label ?? "Economy";

export const addDays = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export interface FlightQuery {
  from: string;
  to: string;
  depart: string;
  ret: string;
  trip: "one" | "two";
  adults: number;
  children: number;
  cabin: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const int = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(str(v));
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

export function flightQueryFromRoute(q: Record<string, unknown>): FlightQuery {
  const code = (v: unknown, fallback: string) =>
    /^[A-Za-z]{3}$/.test(str(v)) ? str(v).toUpperCase() : fallback;
  const date = (v: unknown, fallback: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(str(v)) ? str(v) : fallback;

  const depart = date(q.depart, addDays(14));
  let ret = date(q.return, addDays(21));
  if (ret < depart) ret = depart;
  const cabin = str(q.cabin).toUpperCase();

  return {
    from: code(q.from, "ARN"),
    to: code(q.to, "IST"),
    depart,
    ret,
    trip: q.trip === "one" ? "one" : "two",
    adults: int(q.adults, 1, 9, 1),
    children: int(q.children, 0, 9, 0),
    cabin: CABIN_OPTIONS.some((o) => o.value === cabin) ? cabin : "ECONOMY",
  };
}

export interface FlightLayover {
  code: string;
  name: string;
  duration: string;
  changeAirport: boolean;
  overnight: boolean;
}

export interface FlightLeg {
  fromCode: string;
  toCode: string;
  fromName: string;
  toName: string;
  departure: string;
  landing: string;
  dayChange: number;
  duration: string;
  minutes: number;
  stops: number;
  stopText: string;
  via: string;
  layovers: FlightLayover[];
}

export interface FlightCard {
  key: string;
  offerId: string;
  airline: string;
  airlineCode: string;
  logoUrl: string;
  cabin: string;
  price: number;
  currency: string;
  seats: number | null;
  baggage: string;
  out: FlightLeg;
  back: FlightLeg | null;
}

interface RawMinutes {
  minutes?: number;
}
interface RawCarrier {
  marketingLogo?: string;
  marketingName?: string;
  operatingName?: string;
  marketingCode?: string;
}
interface RawSegment {
  direction?: string;
  originCode?: string;
  originName?: string;
  destinationCode?: string;
  destinationName?: string;
  departureTime?: string;
  arrivalTime?: string;
  stopCount?: number | string;
  duration?: RawMinutes;
  carrier?: RawCarrier;
  flight?: { marketingNumber?: string | number };
}
interface RawConnection {
  direction?: string;
  arrivalAirportCode?: string;
  arrivalAirportName?: string;
  duration?: RawMinutes;
  changeAirport?: boolean;
  overnight?: boolean;
}
interface RawPricing {
  display?: {
    total?: number | string;
    taxes?: number | string;
    currency?: string;
    perPassenger?: Record<string, { total?: number | string } | undefined>;
  };
}
interface RawBag {
  bagType?: string;
  passengerType?: string;
  pieces?: number;
  weightKg?: number;
  description?: string;
}
interface RawFare {
  family?: string;
  seatsRemaining?: number | string;
}
interface RawOffer {
  offerId?: string | number;
  pricing?: RawPricing;
  fare?: RawFare;
  baggage?: { hasCheckedBag?: boolean; hasCarryOnBag?: boolean };
}
interface RawJourney {
  journeyKey?: string | number;
  segments?: RawSegment[];
  connections?: RawConnection[];
  legDurations?: { direction?: string; duration?: RawMinutes }[];
  cheapestOffer?: RawOffer;
  offers?: RawOffer[];
  pricing?: RawPricing;
  fare?: RawFare;
  expiration?: string;
  baggage?: {
    hasCheckedBag?: boolean;
    hasCarryOnBag?: boolean;
    included?: RawBag[];
  };
  terms?: {
    refundable?: boolean;
    changeable?: boolean;
    summary?: { level?: string; message?: string }[];
  };
}
interface RawChanges {
  priceChanged?: boolean;
  pricing?: { old?: RawPricing; new?: RawPricing };
  messages?: unknown[];
}

const time = (iso?: string) => (iso ?? "").slice(11, 16);

const dayDiff = (a?: string, b?: string) => {
  if (!a || !b) return 0;
  const d = (s: string) =>
    Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((d(b) - d(a)) / 86400000);
};

export const formatMinutes = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
};

export function formatFlightPrice(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

function buildLeg(
  journey: RawJourney,
  dir: "OUTBOUND" | "INBOUND",
): FlightLeg | null {
  const segs = (journey.segments ?? []).filter(
    (s) => (s.direction || "OUTBOUND") === dir,
  );
  if (!segs.length) return null;
  const first = segs[0]!;
  const last = segs[segs.length - 1]!;

  const conns = (journey.connections ?? []).filter(
    (c) => (c.direction || "OUTBOUND") === dir,
  );
  const technical = segs.reduce((n, s) => n + (Number(s.stopCount) || 0), 0);
  const stops = conns.length + technical;

  const minutes =
    journey.legDurations?.find((d) => d.direction === dir)?.duration?.minutes ??
    segs.reduce((n, s) => n + (s.duration?.minutes || 0), 0);

  const onlyGap = conns.length === 1 ? conns[0]?.duration?.minutes : undefined;
  const layover = onlyGap ? ` (${formatMinutes(onlyGap)} layover)` : "";
  const via = conns
    .map((c) =>
      [c.arrivalAirportCode, c.arrivalAirportName].filter(Boolean).join(" "),
    )
    .filter(Boolean);

  return {
    fromCode: first.originCode ?? "",
    toCode: last.destinationCode ?? "",
    fromName: first.originName ?? "",
    toName: last.destinationName ?? "",
    departure: time(first.departureTime),
    landing: time(last.arrivalTime),
    dayChange: Math.max(0, dayDiff(first.departureTime, last.arrivalTime)),
    duration: formatMinutes(minutes),
    minutes: Number(minutes) || 0,
    stops,
    stopText:
      stops === 0
        ? "Non-stop"
        : `${stops} ${stops === 1 ? "stop" : "stops"}${layover}`,
    via: stops === 0 ? "Direct flight" : via.join(", ") || "Technical stop",
    layovers: conns.map((c) => ({
      code: c.arrivalAirportCode ?? "",
      name: c.arrivalAirportName ?? "",
      duration: c.duration?.minutes ? formatMinutes(c.duration.minutes) : "",
      changeAirport: !!c.changeAirport,
      overnight: !!c.overnight,
    })),
  };
}

export function toFlightCards(res: unknown): FlightCard[] {
  const data = (res as { data?: unknown } | null)?.data;
  const sets = (Array.isArray(data) ? data : []) as {
    journeys?: RawJourney[];
  }[];
  const seen = new Set<string>();
  const cards: FlightCard[] = [];

  for (const set of sets) {
    for (const j of set?.journeys ?? []) {
      const offer = j.cheapestOffer ?? j.offers?.[0];
      const price = Number(offer?.pricing?.display?.total);
      const out = buildLeg(j, "OUTBOUND");
      if (!offer || !out || !Number.isFinite(price)) continue;

      const key = String(j.journeyKey ?? offer.offerId);
      if (seen.has(key)) continue;
      seen.add(key);

      const firstSeg = (j.segments ?? []).find(
        (s) => (s.direction || "OUTBOUND") === "OUTBOUND",
      );
      const carrier = firstSeg?.carrier ?? {};
      const logo = String(carrier.marketingLogo ?? "");
      const seats = Number(offer.fare?.seatsRemaining);

      cards.push({
        key,
        offerId: String(offer.offerId ?? ""),
        airline:
          carrier.marketingName ||
          carrier.operatingName ||
          carrier.marketingCode ||
          "Airline",
        airlineCode: String(carrier.marketingCode ?? ""),
        logoUrl: /^https?:\/\//.test(logo) ? logo : "",
        cabin: offer.fare?.family || "Economy",
        price,
        currency: offer.pricing?.display?.currency || "USD",
        seats: Number.isFinite(seats) ? seats : null,
        baggage: offer.baggage?.hasCheckedBag
          ? "Checked bag included"
          : offer.baggage?.hasCarryOnBag
            ? "Carry-on bag only"
            : "No bags included",
        out,
        back: buildLeg(j, "INBOUND"),
      });
    }
  }
  return cards.sort((a, b) => a.price - b.price);
}

export interface DetailSegment {
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  departure: string;
  landing: string;
  dayChange: number;
  duration: string;
  flightNo: string;
  airline: string;
  airlineCode: string;
  logoUrl: string;
}

export interface DetailLeg {
  date: string;
  arriveDate: string;
  stops: number;
  stopText: string;
  segments: DetailSegment[];
  layovers: FlightLayover[];
}

export interface FlightDetail {
  price: number;
  currency: string;
  taxes: number | null;
  fare: string;
  seats: number | null;
  expiration: string;
  cabinBag: string;
  checkedBag: string;
  refundable: boolean;
  changeable: boolean;
  terms: { level: string; message: string }[];
  priceChange: { oldPrice: number; newPrice: number } | null;
  perPassenger: { adult: number | null; child: number | null };
  messages: string[];
  out: DetailLeg;
  back: DetailLeg | null;
}

export function formatFlightDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return "";
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function gapText(arrive?: string, depart?: string) {
  const mins = Math.round(
    (Date.parse(depart ?? "") - Date.parse(arrive ?? "")) / 60000,
  );
  return Number.isFinite(mins) && mins > 0 ? formatMinutes(mins) : "";
}

function detailLeg(
  journey: RawJourney,
  dir: "OUTBOUND" | "INBOUND",
): DetailLeg | null {
  const segs = (journey.segments ?? []).filter(
    (s) => (s.direction || "OUTBOUND") === dir,
  );
  if (!segs.length) return null;

  const segments: DetailSegment[] = segs.map((s) => {
    const carrier = s.carrier ?? {};
    const logo = String(carrier.marketingLogo ?? "");
    return {
      fromCode: s.originCode ?? "",
      fromName: s.originName ?? "",
      toCode: s.destinationCode ?? "",
      toName: s.destinationName ?? "",
      departure: time(s.departureTime),
      landing: time(s.arrivalTime),
      dayChange: Math.max(0, dayDiff(s.departureTime, s.arrivalTime)),
      duration: s.duration?.minutes ? formatMinutes(s.duration.minutes) : "",
      flightNo: `${carrier.marketingCode ?? ""}${s.flight?.marketingNumber ?? ""}`,
      airline:
        carrier.marketingName ||
        carrier.operatingName ||
        carrier.marketingCode ||
        "Airline",
      airlineCode: String(carrier.marketingCode ?? ""),
      logoUrl: /^https?:\/\//.test(logo) ? logo : "",
    };
  });

  const technical = segs.reduce((n, s) => n + (Number(s.stopCount) || 0), 0);
  const stops = segs.length - 1 + technical;

  return {
    date: String(segs[0]?.departureTime ?? "").slice(0, 10),
    arriveDate: String(segs[segs.length - 1]?.arrivalTime ?? "").slice(0, 10),
    stops,
    stopText:
      stops === 0 ? "Non-stop" : `${stops} ${stops === 1 ? "stop" : "stops"}`,
    segments,
    layovers: segments.slice(0, -1).map((s, i) => ({
      code: s.toCode,
      name: s.toName,
      duration: gapText(segs[i]?.arrivalTime, segs[i + 1]?.departureTime),
      changeAirport: s.toCode !== segments[i + 1]!.fromCode,
      overnight: false,
    })),
  };
}

const bagText = (e?: RawBag) => {
  if (!e) return "Not included";
  const parts: string[] = [];
  if (e.pieces)
    parts.push(`${e.pieces} ${e.pieces === 1 ? "piece" : "pieces"}`);
  if (e.weightKg) parts.push(`${e.weightKg} kg`);
  return parts.join(", ") || e.description || "Included";
};

export function toFlightDetail(res: unknown): FlightDetail | null {
  const d = (
    res as {
      data?: { journey?: RawJourney; changes?: RawChanges }[];
    } | null
  )?.data?.[0];
  const j = d?.journey;
  const price = Number(j?.pricing?.display?.total);
  if (!j || !Number.isFinite(price)) return null;
  const out = detailLeg(j, "OUTBOUND");
  if (!out) return null;

  const bags = j.baggage?.included ?? [];
  const adult = (type: string) =>
    bags.find(
      (b) => b.bagType === type && (b.passengerType ?? "ADT") === "ADT",
    ) ?? bags.find((b) => b.bagType === type);

  const taxes = Number(j.pricing?.display?.taxes);
  const seats = Number(j.fare?.seatsRemaining);
  const oldPrice = Number(d.changes?.pricing?.old?.display?.total);
  const newPrice = Number(d.changes?.pricing?.new?.display?.total);

  const per = (type: string) => {
    const n = Number(j.pricing?.display?.perPassenger?.[type]?.total);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  return {
    price,
    currency: j.pricing?.display?.currency || "USD",
    taxes: Number.isFinite(taxes) ? taxes : null,
    fare: j.fare?.family || "Economy",
    seats: Number.isFinite(seats) ? seats : null,
    expiration: String(j.expiration ?? ""),
    cabinBag:
      j.baggage?.hasCarryOnBag === false
        ? "Not included"
        : bagText(adult("cabin")),
    checkedBag:
      j.baggage?.hasCheckedBag === false
        ? "Not included"
        : bagText(adult("checked")),
    refundable: !!j.terms?.refundable,
    changeable: !!j.terms?.changeable,
    terms: (j.terms?.summary ?? []).map((t) => ({
      level: String(t.level ?? "info"),
      message: String(t.message ?? ""),
    })),
    priceChange:
      d.changes?.priceChanged &&
      Number.isFinite(oldPrice) &&
      Number.isFinite(newPrice)
        ? { oldPrice, newPrice }
        : null,
    messages: (d.changes?.messages ?? []).map(String),
    perPassenger: { adult: per("adult"), child: per("child") },
    out,
    back: detailLeg(j, "INBOUND"),
  };
}
