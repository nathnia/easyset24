import { defineStore } from "pinia";

export const useLocationsStore = defineStore("locations", {
  state: () => ({
    cities: [] as string[],
    country: "",
  }),

  actions: {
    async fetchCities(countryCode: string) {
      if (this.country === countryCode && this.cities.length) return; // static data: load once per country
      try {
        const res: any = await $fetch("/api/cities", {
          query: { countryCode },
        });
        const list: { city?: string }[] = Array.isArray(res)
          ? res
          : (res?.data ?? []);
        this.country = countryCode;
        this.cities = list
          .map((c) => c.city ?? "")
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
      } catch {}
    },
  },
});
