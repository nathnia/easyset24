import { liteapi } from "../utils/liteapi-proxy";

const IATA = /^[A-Za-z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CABINS = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

const bad = (message: string) =>
  createError({ statusCode: 400, statusMessage: message });

export default defineEventHandler(async (event) => {
  const b = (await readBody(event)) ?? {};

  if (!Array.isArray(b.legs) || b.legs.length < 1 || b.legs.length > 2) {
    throw bad("legs must contain 1 (one-way) or 2 (round-trip) entries");
  }
  const legs = b.legs.map((l: any, i: number) => {
    if (!IATA.test(String(l?.origin)) || !IATA.test(String(l?.destination))) {
      throw bad("origin and destination must be 3-letter codes");
    }
    if (!DATE.test(String(l?.date))) throw bad("date must be YYYY-MM-DD");
    return {
      origin: String(l.origin).toUpperCase(),
      destination: String(l.destination).toUpperCase(),
      date: String(l.date),
      direction: i === 0 ? "OUTBOUND" : "INBOUND",
    };
  });

  const adults = Number(b.adults);
  const children = Number(b.children ?? 0);
  const infants = Number(b.infants ?? 0);
  if (!Number.isInteger(adults) || adults < 1)
    throw bad("adults must be at least 1");
  if (!Number.isInteger(children) || children < 0)
    throw bad("invalid children");
  if (!Number.isInteger(infants) || infants < 0 || infants > adults) {
    throw bad("infants cannot exceed adults");
  }

  const currency = String(b.currency ?? "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw bad("invalid currency");

  const body: Record<string, unknown> = {
    legs,
    adults,
    children,
    infants,
    currency,
    sort: { sortBy: "price", sortOrder: "asc" },
  };
  if (b.cabinClass !== undefined) {
    const cabin = String(b.cabinClass).toUpperCase();
    if (!CABINS.includes(cabin)) throw bad("invalid cabinClass");
    body.cabinClass = cabin;
  }

  return liteapi(event, "/flights/rates", {}, { body });
});
