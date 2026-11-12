// Plane photos for flight cards. No airline gets a special photo: each airline name
// is hashed to one photo of the pool, so it looks random but stays the same on every render.

// Known to load. Used as the fallback when another photo is dead.
const SAFE = [
  "photo-1436491865332-7a61a109cc05",
  "photo-1464037866556-6812c9d1c72e",
  "photo-1569629743817-70d8db6c323b",
];

// More photos for variety. To change one, replace its id.
// A dead id is fine: the card falls back to one of the SAFE photos.
const EXTRA = [
  "photo-1474302770737-173ee21bab63",
  "photo-1529074963764-98f45c47344b",
  "photo-1517479149777-5f3b1511d5ad",
  "photo-1569154941061-e231b4725ef1",
  "photo-1542296332-2e4473faf563",
  "photo-1556388158-158ea5ccacbd",
  "photo-1520437358207-323b43b50729",
  "photo-1507812984078-917a274065be",
];
const POOL = [...SAFE, ...EXTRA];

const hash = (s: string) =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const flightImage = (airline: string, w = 500, h = 700) =>
  unsplash(POOL[hash(airline) % POOL.length]!, w, h);

export const onFlightImgError = (
  e: Event,
  airline: string,
  w = 500,
  h = 700,
) => {
  const el = e.target as HTMLImageElement;
  const fallback = unsplash(SAFE[hash(airline) % SAFE.length]!, w, h);
  if (el.src !== fallback) el.src = fallback;
};
