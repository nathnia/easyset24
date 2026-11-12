import { defineStore } from "pinia";
import { toFlightCards, toFlightDetail } from "~/utils/flights";
import type { FlightCard, FlightDetail, FlightQuery } from "~/utils/flights";

let latest = 0; // ignore answers of older searches
let latestVerify = 0;

export const useFlightsStore = defineStore("flights", {
  state: () => ({
    cards: [] as FlightCard[],
    loading: false,
    error: "",
    // the verified offer shown on the detail page
    detail: null as FlightDetail | null,
    detailLoading: false,
    detailError: "",
  }),

  actions: {
    // Confirm the offer is still available and get the latest price
    async verify(offerId: string) {
      const id = ++latestVerify;
      this.detail = null;
      this.detailError = "";
      if (!offerId) {
        this.detailError =
          "This flight link is incomplete. Please search again.";
        return;
      }
      this.detailLoading = true;
      try {
        const res = await $fetch("/api/flight-verify", {
          method: "POST",
          body: { offerId },
        });
        if (id !== latestVerify) return;
        const detail = toFlightDetail(res);
        if (!detail) throw new Error("empty");
        this.detail = detail;
      } catch (e: any) {
        if (id !== latestVerify) return;
        const code = e?.statusCode ?? e?.status;
        const msg = e?.data?.statusMessage || e?.statusMessage || "";
        this.detailError =
          code === 404 || code === 502
            ? `This fare is no longer available, or its price changed. Please search again.${msg ? ` (${msg})` : ""}`
            : msg || "Could not verify this flight.";
      } finally {
        if (id === latestVerify) this.detailLoading = false;
      }
    },

    async search(q: FlightQuery) {
      const id = ++latest;
      this.loading = true;
      this.error = "";

      const legs = [{ origin: q.from, destination: q.to, date: q.depart }];
      if (q.trip === "two") {
        legs.push({ origin: q.to, destination: q.from, date: q.ret });
      }

      try {
        const res = await $fetch("/api/flight-rates", {
          method: "POST",
          body: {
            legs,
            adults: q.adults,
            children: q.children,
            infants: 0,
            cabinClass: q.cabin,
            currency: "USD",
          },
        });
        if (id !== latest) return;
        this.cards = toFlightCards(res);
      } catch (e: any) {
        if (id !== latest) return;
        this.cards = [];
        this.error =
          e?.data?.statusMessage ||
          e?.statusMessage ||
          "Could not load flights.";
      } finally {
        if (id === latest) this.loading = false;
      }
    },
  },
});
