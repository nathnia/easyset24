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

export interface LiteApiHotelDetail {
  id: string;
  name: string;
  hotelDescription?: string;
  main_photo?: string;
  hotelImages?: { url?: string; urlHd?: string; caption?: string }[];
  hotelFacilities?: (string | { name?: string })[];
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
