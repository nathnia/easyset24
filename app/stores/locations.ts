import { defineStore } from "pinia";

export const useLocationsStore = defineStore("locations", {
  state: () => ({
    cities: [] as string[],
  }),

  actions: {
    async fetchCities(countryCode: string) {
      if (this.cities.length) return; // static data: load once
      try {
        const res: any = await $fetch("/api/cities", {
          query: { countryCode },
        });
        // LiteAPI wraps lists in { data: [{ city }] }; accept a bare array too
        const list: { city?: string }[] = Array.isArray(res)
          ? res
          : (res?.data ?? []);
        this.cities = list
          .map((c) => c.city ?? "")
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
      } catch {
        // input still accepts free typing
      }
    },
  },
});
