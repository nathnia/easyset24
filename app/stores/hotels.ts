import { defineStore } from "pinia";
import {
  toHotelCard,
  toHotelDetail,
  toReviewCard,
  toRates,
} from "~/utils/liteapi";
import type {
  LiteApiHotel,
  LiteApiHotelsResponse,
  LiteApiHotelDetailResponse,
  LiteApiReviewsResponse,
} from "~/utils/liteapi";

const LIMIT = 20;

export const useHotelsStore = defineStore("hotels", {
  state: () => ({
    items: [] as LiteApiHotel[],
    loading: false,
    loadingMore: false,
    error: "",
    hasMore: false,
    detail: null as ReturnType<typeof toHotelDetail> | null,
    detailLoading: false,
    detailError: "",
    reviews: [] as ReturnType<typeof toReviewCard>[],
    rates: [] as ReturnType<typeof toRates>,
  }),

  getters: {
    // Shape expected by <HotelCard>
    cards: (state) => state.items.map(toHotelCard),
  },

  actions: {
    async fetchHotels(city: string, country: string) {
      this.loading = true;
      this.error = "";
      try {
        const res = await $fetch<LiteApiHotelsResponse>("/api/hotels", {
          query: { cityName: city, countryCode: country, limit: LIMIT },
        });
        this.items = res.data;
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
        // reviews are optional: the page still works without them
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
          },
        });
        this.items = [...this.items, ...res.data];
        this.hasMore = res.data.length === LIMIT;
      } catch {
        this.hasMore = false;
      } finally {
        this.loadingMore = false;
      }
    },
  },
});
