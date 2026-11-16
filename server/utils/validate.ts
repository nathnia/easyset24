export const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const PER_ROOM = 2;

export const text = (v: unknown, max = 100) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const clampInt = (
  v: unknown,
  min: number,
  max: number,
  fallback: number,
) => {
  const n = Number(v);
  return Number.isInteger(n) ? Math.min(Math.max(n, min), max) : fallback;
};

export const roomCount = (guests: number) => Math.ceil(guests / PER_ROOM);

export const occupancies = (guests: number) => {
  const rooms = roomCount(guests);
  return Array.from({ length: rooms }, (_, i) => ({
    adults: i < rooms - 1 ? PER_ROOM : guests - PER_ROOM * (rooms - 1),
  }));
};
