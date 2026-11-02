// Types and mapper for LiteAPI GET /data/hotels

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

const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/easyset-hotel/800/600";

// /data/hotels and /data/hotel return no price, so price is a hardcoded mock: $40 per star.
// Replace with real rates from POST /hotels/rates later.
const mockPrice = (stars?: number) => `$${(stars || 3) * 40}`;

// Shape expected by <HotelCard>.
export function toHotelCard(h: LiteApiHotel) {
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
    price: mockPrice(stars),
  };
}

// ---- GET /data/hotel (details of one hotel)

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

// facility keyword -> icon (icons already used by the detail page)
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

// Description may contain HTML. Strip tags (no v-html) and split into paragraphs.
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

// Shape expected by pages/hotels/[id].vue
export function toHotelDetail(h: LiteApiHotelDetail) {
  const urls = (h.hotelImages ?? [])
    .map((i) => i.urlHd || i.url)
    .filter((u): u is string => !!u);
  const paragraphs = toParagraphs(h.hotelDescription);
  const half = Math.ceil(paragraphs.length / 2);

  return {
    id: h.id,
    name: h.name,
    // page grid needs exactly 5 images
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
    price: mockPrice(h.starRating),
  };
}

// ---- GET /data/reviews (guest reviews of one hotel)

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
  // only when getSentiment=true
  sentimentAnalysis?: { categories?: { name: string; rating: number }[] };
}

// Shape expected by the review cards in pages/hotels/[id].vue
export function toReviewCard(r: LiteApiReview) {
  const name = r.name?.trim() || "Guest";
  const country = (r.country ?? "").toLowerCase();
  return {
    name,
    // API has no guest photos: placeholder face, stable per name
    avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(name)}`,
    country: /^[a-z]{2}$/.test(country) ? country : "",
    score: r.averageScore ? `${r.averageScore}/10` : "",
    text: r.pros?.trim() || r.headline?.trim() || r.cons?.trim() || "",
  };
}

// Shape expected by the "Review Rates" bars (score out of 10)
export function toRates(s?: LiteApiReviewsResponse["sentimentAnalysis"]) {
  return (s?.categories ?? [])
    .filter((c) => c.name && typeof c.rating === "number")
    .slice(0, 5)
    .map((c) => ({ label: c.name, score: Number(c.rating.toFixed(1)) }));
}
