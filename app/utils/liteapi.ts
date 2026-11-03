export interface LiteApiHotel {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  address?: string;
  city?: string;
  country?: string;
  stars?: number;
  starRating?: number;
  rating?: number;
  reviewCount?: number;
}

export interface LiteApiHotelsResponse {
  data: LiteApiHotel[];
}

// number = price, null = hotel not in min-rates (sold out), "error" = request failed
export type PriceState = number | null | "error";

const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/easyset-hotel/800/600";

export function toHotelCard(
  h: LiteApiHotel,
  price?: PriceState,
  stay?: StayInfo | null,
) {
  const stars = h.stars ?? h.starRating;
  return {
    id: h.id,
    name: h.name,
    image: h.main_photo || h.thumbnail || PLACEHOLDER_IMAGE,
    location: [h.address, h.city].filter(Boolean).join(", "),
    ratingLabel: stars ? `${stars} Stars` : "",
    reviews: h.reviewCount
      ? `${h.reviewCount.toLocaleString("en-US")} Reviews`
      : "",
    rating: h.rating ? h.rating.toFixed(1) : "-",
    price: formatPrice(price),
    guests: stay
      ? `${stay.adults} ${stay.adults === 1 ? "Adult" : "Adults"}`
      : undefined,
    nights: stay
      ? `${stay.nights} ${stay.nights === 1 ? "Night" : "Nights"}`
      : undefined,
  };
}

export interface LiteApiRoom {
  id: number | string;
  roomName?: string;
  description?: string;
  roomSizeSquare?: number;
  roomSizeUnit?: string;
  maxOccupancy?: number;
  bedTypes?: { quantity?: number; bedType?: string; bedSize?: string }[];
  photos?: { url?: string; hd_url?: string }[];
}

export interface LiteApiHotelDetail {
  id: string;
  name: string;
  hotelDescription?: string;
  main_photo?: string;
  hotelImages?: { url?: string; urlHd?: string; caption?: string }[];
  hotelFacilities?: (string | { name?: string })[];
  rooms?: LiteApiRoom[];
  address?: string;
  city?: string;
  country?: string;
  starRating?: number;
  rating?: number;
  reviewCount?: number;
}

export interface LiteApiHotelDetailResponse {
  data: LiteApiHotelDetail;
}

const FACILITY_ICONS: [RegExp, string][] = [
  [/wi-?fi|internet/i, "icon-park-outline:wifi"],
  [/parking/i, "icon-park-outline:parking"],
  [/restaurant|dining/i, "icon-park-outline:knife-fork"],
  [/fitness|gym/i, "icon-park-outline:dumbbell"],
  [/bath|shower/i, "icon-park-outline:shower-head"],
  [/room service/i, "icon-park-outline:tray"],
  [/air.?condition/i, "icon-park-outline:air-conditioning"],
  [/coffee|tea/i, "icon-park-outline:coffee-machine"],
];

function toParagraphs(html?: string) {
  return (html ?? "")
    .replace(/<\/(p|div|li)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function toHotelDetail(h: LiteApiHotelDetail) {
  const urls = (h.hotelImages ?? [])
    .map((i) => i.urlHd || i.url)
    .filter((u): u is string => !!u);
  const paragraphs = toParagraphs(h.hotelDescription);
  const half = Math.ceil(paragraphs.length / 2);

  return {
    id: h.id,
    name: h.name,
    images: Array.from(
      { length: 5 },
      (_, i) => urls[i] || h.main_photo || PLACEHOLDER_IMAGE,
    ),
    descriptionCols: [paragraphs.slice(0, half), paragraphs.slice(half)],
    amenities: (h.hotelFacilities ?? [])
      .map((f) => (typeof f === "string" ? f : (f.name ?? "")))
      .filter(Boolean)
      .slice(0, 8)
      .map((label) => ({
        label,
        icon:
          FACILITY_ICONS.find(([re]) => re.test(label))?.[1] ??
          "icon-park-outline:check-one",
      })),
    address: [h.address, h.city, h.country].filter(Boolean).join(", "),
    roomsById: Object.fromEntries(
      (h.rooms ?? []).map((r) => [String(r.id), r]),
    ) as Record<string, LiteApiRoom>,
  };
}

export interface LiteApiReview {
  averageScore?: number;
  country?: string;
  type?: string;
  name?: string;
  date?: string;
  headline?: string;
  pros?: string;
  cons?: string;
}

export interface LiteApiReviewsResponse {
  data: LiteApiReview[];
  total?: number;
  sentimentAnalysis?: { categories?: { name: string; rating: number }[] };
}

export function toReviewCard(r: LiteApiReview) {
  const name = r.name?.trim() || "Guest";
  const country = (r.country ?? "").toLowerCase();
  return {
    name,
    avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(name)}`,
    country: /^[a-z]{2}$/.test(country) ? country : "",
    score: r.averageScore ? `${r.averageScore}/10` : "",
    text: r.pros?.trim() || r.headline?.trim() || r.cons?.trim() || "",
  };
}

export function toRates(s?: LiteApiReviewsResponse["sentimentAnalysis"]) {
  return (s?.categories ?? [])
    .filter((c) => c.name && typeof c.rating === "number")
    .slice(0, 5)
    .map((c) => ({ label: c.name, score: Number(c.rating.toFixed(1)) }));
}

export interface Facility {
  id: number;
  name: string;
}

export function toFacility(f: any): Facility | null {
  const id = f?.facility_id ?? f?.facilityId ?? f?.id;
  const name = f?.facility ?? f?.facility_name ?? f?.name;
  return id != null && name ? { id: Number(id), name: String(name) } : null;
}

export interface LiteApiMinRatesResponse {
  data: { hotelId: string; price: number; suggestedSellingPrice?: number }[];
}

const DAY = 86400000;
const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function stayFromQuery(query: Record<string, unknown>) {
  const checkin = isDate(query.checkin)
    ? query.checkin
    : isoDate(Date.now() + 7 * DAY);
  let checkout = isDate(query.checkout)
    ? query.checkout
    : isoDate(Date.parse(checkin) + 2 * DAY);
  if (Date.parse(checkout) <= Date.parse(checkin)) {
    checkout = isoDate(Date.parse(checkin) + DAY);
  }
  const adults = Math.min(Math.max(Number(query.adults) || 2, 1), 9);
  const nights = Math.round((Date.parse(checkout) - Date.parse(checkin)) / DAY);
  return { checkin, checkout, adults, nights };
}

export type StayInfo = ReturnType<typeof stayFromQuery>;

export function formatPrice(price?: PriceState) {
  if (price === undefined) return "...";
  if (price === "error") return "Price unavailable";
  if (price === null) return "Not available";
  return `$${Math.round(price).toLocaleString("en-US")}`;
}

// ---- POST /hotels/rates (room offers) ----

interface Money {
  amount?: number;
  currency?: string;
}

interface LiteApiRate {
  rateId?: string;
  name?: string;
  boardName?: string;
  maxOccupancy?: number;
  mappedRoomId?: number | string;
  retailRate?: { total?: Money[]; suggestedSellingPrice?: Money[] };
  cancellationPolicies?: {
    refundableTag?: string;
    cancelPolicyInfos?: { cancelTime?: string }[];
  };
}

interface LiteApiRoomType {
  roomTypeId?: string;
  offerId?: string;
  rates?: LiteApiRate[];
  suggestedSellingPrice?: Money;
  offerRetailRate?: Money;
}

export interface LiteApiRatesResponse {
  data?: { hotelId: string; roomTypes?: LiteApiRoomType[] }[];
}

// One roomType = one bookable offer (one rate per room when several rooms are requested)
export function toRoomOffers(
  res: LiteApiRatesResponse,
  roomsById: Record<string, LiteApiRoom> = {},
) {
  const types = res.data?.[0]?.roomTypes ?? [];
  const offers = types.flatMap((t) => {
    const rates = t.rates ?? [];
    const first = rates[0];
    if (!t.offerId || !first) return [];

    const sum = rates.reduce(
      (acc, r) =>
        acc +
        (r.retailRate?.suggestedSellingPrice?.[0]?.amount ??
          r.retailRate?.total?.[0]?.amount ??
          0),
      0,
    );
    const price =
      t.suggestedSellingPrice?.amount ?? (sum || t.offerRetailRate?.amount);
    if (price === undefined) return [];

    const room = roomsById[String(first.mappedRoomId)];
    const cancel = first.cancellationPolicies;
    const cancelTime = cancel?.cancelPolicyInfos?.[0]?.cancelTime;
    const photo = room?.photos?.[0];

    return [
      {
        offerId: t.offerId,
        name: room?.roomName || first.name || "Room",
        rateName: first.name ?? "",
        board: first.boardName || "Room only",
        rooms: rates.length,
        price,
        refundable: cancel?.refundableTag === "RFN",
        cancelUntil: cancelTime ? cancelTime.slice(0, 10) : "",
        image: photo?.hd_url || photo?.url || "",
        beds: (room?.bedTypes ?? [])
          .filter((b) => b.bedType)
          .map((b) => `${b.quantity ?? 1} ${b.bedType}`)
          .join(", "),
        size: room?.roomSizeSquare
          ? `${room.roomSizeSquare} ${room.roomSizeUnit ?? "m²"}`
          : "",
        maxOccupancy: first.maxOccupancy ?? room?.maxOccupancy,
        description: toParagraphs(room?.description)[0] ?? "",
      },
    ];
  });
  return offers.sort((a, b) => a.price - b.price);
}

export type RoomOffer = ReturnType<typeof toRoomOffers>[number];
