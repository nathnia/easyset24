import { defineStore } from "pinia";
import { toAirportList } from "~/utils/airports";
import type { Airport } from "~/utils/airports";

export const useAirportsStore = defineStore("airports", {
  state: () => ({
    // every airport seen so far, by IATA code (to show names for codes in the URL)
    known: {} as Record<string, Airport>,
  }),

  actions: {
    // Type-ahead search. Returns null when the request failed.
    async search(q: string): Promise<Airport[] | null> {
      const term = q.trim();
      if (term.length < 2) return [];
      try {
        const res = await $fetch("/api/flight-airports", {
          query: { q: term },
        });
        const list = toAirportList(res);
        for (const a of list) this.known[a.code] = a;
        return list;
      } catch {
        return null;
      }
    },

    // Resolve one code ("ARN") to its airport, using the search endpoint
    async lookup(code: string) {
      if (this.known[code]) return this.known[code];
      const list = await this.search(code);
      return list?.find((a) => a.code === code);
    },
  },
});
