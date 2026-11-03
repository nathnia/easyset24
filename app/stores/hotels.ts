import { defineStore } from "pinia";
import {
  toHotelCard,
  toHotelDetail,
  toReviewCard,
  toRates,
  toFacility,
  formatPrice,
} from "~/utils/liteapi";
import type {
  Facility,
  LiteApiHotel,
  LiteApiHotelsResponse,
  LiteApiHotelDetailResponse,
  LiteApiReviewsResponse,
  LiteApiMinRatesResponse,
  PriceState,
  StayInfo,
} from "~/utils/liteapi";

const LIMIT = 20;

const slim = (h: LiteApiHotel): LiteApiHotel => ({
  id: h.id,
  name: h.name,
  main_photo: h.main_photo,
  thumbnail: h.thumbnail,
  address: h.address,
  city: h.city,
  country: h.country,
  stars: h.stars,
  starRating: h.starRating,
  rating: h.rating,
  reviewCount: h.reviewCount,
});

export const useHotelsStore = defineStore("hotels", {
  state: () => ({
    items: [] as LiteApiHotel[],
    prices: {} as Record<string, PriceState>,
    stay: null as StayInfo | null,
    loading: false,
    loadingMore: false,
    error: "",
    hasMore: false,
    facilities: [] as Facility[],
    facilityIds: [] as number[],
    detail: null as ReturnType<typeof toHotelDetail> | null,
    detailLoading: false,
    detailError: "",
    reviews: [] as ReturnType<typeof toReviewCard>[],
    rates: [] as ReturnType<typeof toRates>,
  }),

  getters: {
    cards: (state) =>
      state.items.map((h) => toHotelCard(h, state.prices[h.id], state.stay)),
    detailPrice: (state) =>
      state.detail ? formatPrice(state.prices[state.detail.id]) : "",
  },

  actions: {
    facilityQuery() {
      return this.facilityIds.length
        ? {
            facilityIds: this.facilityIds.join(","),
            strictFacilitiesFiltering: "true",
          }
        : {};
    },

    async fetchPrices(ids: string[], stay: StayInfo) {
      if (!ids.length) return;
      const body = {
        hotelIds: ids,
        checkin: stay.checkin,
        checkout: stay.checkout,
        adults: stay.adults,
      };

      let res: LiteApiMinRatesResponse | undefined;
      for (let attempt = 0; attempt < 2 && !res; attempt++) {
        try {
          res = await $fetch<LiteApiMinRatesResponse>("/api/min-rates", {
            method: "POST",
            body,
          });
        } catch {
          // retry once
        }
      }

      if (!res) {
        for (const id of ids) this.prices[id] = "error";
        return;
      }

      const found = new Map(
        res.data.map((r) => [r.hotelId, r.suggestedSellingPrice ?? r.price]),
      );
      for (const id of ids) this.prices[id] = found.get(id) ?? null;
    },

    async fetchHotels(city: string, country: string, stay: StayInfo) {
      this.loading = true;
      this.error = "";
      this.stay = stay;
      this.prices = {};
      try {
        const res = await $fetch<LiteApiHotelsResponse>("/api/hotels", {
          query: {
            cityName: city,
            countryCode: country,
            limit: LIMIT,
            ...this.facilityQuery(),
          },
        });
        this.items = res.data.map(slim);
        this.hasMore = res.data.length === LIMIT;
      } catch (e: any) {
        this.items = [];
        this.hasMore = false;
        this.error =
          e?.data?.statusMessage ||
          e?.statusMessage ||
          "Failed to load hotels.";
      } finally {
        this.loading = false;
      }
    },

    async fetchFacilities() {
      if (this.facilities.length) return;
      try {
        const res: any = await $fetch("/api/facilities");
        const list: unknown[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.facilities = list
          .map(toFacility)
          .filter((f): f is Facility => !!f)
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch {
        this.facilities = [];
      }
    },

    async fetchHotel(id: string) {
      this.detail = null;
      this.detailLoading = true;
      this.detailError = "";
      try {
        const res = await $fetch<LiteApiHotelDetailResponse>("/api/hotel", {
          query: { hotelId: id },
        });
        this.detail = toHotelDetail(res.data);
      } catch (e: any) {
        this.detailError =
          e?.data?.statusMessage || e?.statusMessage || "Failed to load hotel.";
      } finally {
        this.detailLoading = false;
      }
    },

    async fetchReviews(id: string) {
      this.reviews = [];
      this.rates = [];
      try {
        const res = await $fetch<LiteApiReviewsResponse>("/api/reviews", {
          query: { hotelId: id, limit: 10, getSentiment: true },
        });
        this.reviews = res.data.map(toReviewCard).filter((r) => r.text);
        this.rates = toRates(res.sentimentAnalysis);
      } catch {
        this.reviews = [];
        this.rates = [];
      }
    },

    async loadMore(city: string, country: string) {
      this.loadingMore = true;
      try {
        const res = await $fetch<LiteApiHotelsResponse>("/api/hotels", {
          query: {
            cityName: city,
            countryCode: country,
            limit: LIMIT,
            offset: this.items.length,
            ...this.facilityQuery(),
          },
        });
        this.items = [...this.items, ...res.data.map(slim)];
        this.hasMore = res.data.length === LIMIT;
      } catch {
        this.hasMore = false;
      } finally {
        this.loadingMore = false;
      }
    },
  },
});
