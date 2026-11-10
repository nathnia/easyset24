// Airport / city codes from LiteAPI GET /data/iataCodes

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Tolerant of a few field spellings; bare "ARN" strings work too
export function toAirport(a: any): Airport | null {
  const raw =
    typeof a === "string"
      ? a
      : (a?.code ?? a?.iataCode ?? a?.iata_code ?? a?.iata);
  const code = str(raw).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  return {
    code,
    name: str(a?.name ?? a?.airportName ?? a?.airport_name),
    city: str(a?.city ?? a?.cityName ?? a?.city_name),
    country: str(a?.countryCode ?? a?.country_code ?? a?.country),
  };
}

// LiteAPI wraps lists in { data: [...] }; accept a bare array too
export function toAirportList(res: any): Airport[] {
  const list: unknown[] = Array.isArray(res) ? res : (res?.data ?? []);
  const byCode = new Map<string, Airport>();
  for (const item of list) {
    const a = toAirport(item);
    if (a && !byCode.has(a.code)) byCode.set(a.code, a);
  }
  return [...byCode.values()];
}

// "ARN - Stockholm"
export const airportLabel = (a: Airport) =>
  [a.code, a.city || a.name].filter(Boolean).join(" - ");

// Best matches first: exact code, code prefix, city prefix, name prefix, contains
export function searchAirports(list: Airport[], query: string, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: [number, Airport][] = [];
  for (const a of list) {
    const code = a.code.toLowerCase();
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    let score = -1;
    if (code === q) score = 0;
    else if (code.startsWith(q)) score = 1;
    else if (city.startsWith(q)) score = 2;
    else if (name.startsWith(q)) score = 3;
    else if (city.includes(q) || name.includes(q)) score = 4;
    if (score >= 0) hits.push([score, a]);
  }
  return hits
    .sort((x, y) => x[0] - y[0] || x[1].code.localeCompare(y[1].code))
    .slice(0, limit)
    .map(([, a]) => a);
}
