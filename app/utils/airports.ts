export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function toAirport(a: any): Airport | null {
  const code = str(a?.iata ?? a?.code ?? a?.iataCode).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  return {
    code,
    name: str(a?.name),
    city: str(a?.city),
    country: str(a?.country ?? a?.countryCode),
  };
}

export function toAirportList(res: any): Airport[] {
  const data: unknown[] = Array.isArray(res) ? res : (res?.data ?? []);
  const rows: unknown[] = [];
  for (const item of data as any[]) {
    if (Array.isArray(item?.airports)) rows.push(...item.airports);
    else rows.push(item);
  }
  const byCode = new Map<string, Airport>();
  for (const row of rows) {
    const a = toAirport(row);
    if (a && !byCode.has(a.code)) byCode.set(a.code, a);
  }
  return [...byCode.values()];
}
