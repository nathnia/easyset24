import { defineStore } from "pinia";
import { toAirportList } from "~/utils/airports";
import type { Airport } from "~/utils/airports";

export const useAirportsStore = defineStore("airports", {
  state: () => ({
    list: [] as Airport[],
    loading: false,
  }),

  actions: {
    // Static data, big list: load once, client side only
    async fetchAirports() {
      if (this.list.length || this.loading) return;
      this.loading = true;
      try {
        const res = await $fetch("/api/iata-codes");
        // markRaw: thousands of rows don't need deep reactivity
        this.list = markRaw(toAirportList(res));
      } catch {
        // inputs still accept a typed 3-letter code
      } finally {
        this.loading = false;
      }
    },

    find(code: string) {
      return this.list.find((a) => a.code === code);
    },
  },
});
