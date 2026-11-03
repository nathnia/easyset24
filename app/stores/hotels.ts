import { defineStore } from "pinia";
import {
  toHotelCard,
  toHotelDetail,
  toReviewCard,
  toRates,
  toFacility,
} from "~/utils/liteapi";
import type {
  Facility,
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
    facilities: [] as Facility[],
    facilityIds: [] as number[],
    detail: null as ReturnType<typeof toHotelDetail> | null,
    detailLoading: false,
    detailError: "",
    reviews: [] as ReturnType<typeof toReviewCard>[],
    rates: [] as ReturnType<typeof toRates>,
  }),

  getters: {
    cards: (state) => state.items.map(toHotelCard),
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

    async fetchHotels(city: string, country: string) {
      this.loading = true;
      this.error = "";
      try {
        const res = await $fetch<LiteApiHotelsResponse>("/api/hotels", {
          query: {
            cityName: city,
            countryCode: country,
            limit: LIMIT,
            ...this.facilityQuery(),
          },
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
