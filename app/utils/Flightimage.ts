const PHOTO_IDS: Record<string, string> = {
  "Turkish Airlines": "photo-1436491865332-7a61a109cc05",
  "Delta Airlines": "photo-1464037866556-6812c9d1c72e",
  Lufthansa: "photo-1569629743817-70d8db6c323b",
  "British Airways": "photo-1530521954074-e64f6810b32d",
};
export const flightImage = (airline: string, w = 500, h = 700) =>
  `https://images.unsplash.com/${PHOTO_IDS[airline] ?? PHOTO_IDS["Turkish Airlines"]}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const onFlightImgError = (
  e: Event,
  airline: string,
  w = 500,
  h = 700,
) => {
  const el = e.target as HTMLImageElement;
  const lock = [...airline].reduce((a, c) => a + c.charCodeAt(0), 0);
  const fallback = `https://loremflickr.com/${w}/${h}/airplane,aircraft?lock=${lock}`;
  if (el.src !== fallback) el.src = fallback;
};
