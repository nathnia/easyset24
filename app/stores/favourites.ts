import { defineStore } from "pinia";
import type { FlightCard } from "~/utils/flights";

// Favourites are remembered in this browser only (mock project: no database).
const HOTELS_KEY = "easyset_fav_hotels";
const FLIGHTS_KEY = "easyset_fav_flights";

export interface FavHotelCard {
  id: string;
  name: string;
  image: string;
  location: string;
  tagline?: string;
  room?: string;
  ratingLabel?: string;
  reviews?: string;
  rating: string;
  discount?: string;
  price: string;
  guests?: string;
  nights?: string;
  left?: string;
  vip?: boolean;
}

export interface FavHotel {
  id: string;
  card: FavHotelCard;
}

export interface FavFlight {
  key: string;
  airline: string;
  airlineCode: string;
  logoUrl: string;
  price: number;
  currency: string;
  fromCity: string;
  toCity: string;
  fromLine: string; // "FCO Rome Fiumicino"
  viaLine: string; // "Direct flight" / layover airport
  toLine: string;
  link: string; // search page URL, shows live fares
}

function read<T>(key: string): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: favourites just stay in memory
  }
}

export const flightFavKey = (c: FlightCard, path: string) =>
  `${path}|${c.airlineCode}|${c.out.departure}|${c.out.landing}`;

export const useFavouritesStore = defineStore("favourites", {
  state: () => ({
    hotels: [] as FavHotel[],
    flights: [] as FavFlight[],
    loaded: false,
  }),
  actions: {
    // browser only: called after the app is mounted so SSR and hydration match
    load() {
      if (this.loaded) return;
      this.hotels = read<FavHotel>(HOTELS_KEY);
      this.flights = read<FavFlight>(FLIGHTS_KEY);
      this.loaded = true;
    },
    hasHotel(id: string) {
      return this.hotels.some((h) => h.id === id);
    },
    toggleHotel(card: FavHotelCard) {
      this.load();
      if (this.hasHotel(card.id)) {
        this.hotels = this.hotels.filter((h) => h.id !== card.id);
      } else {
        this.hotels = [{ id: card.id, card: { ...card } }, ...this.hotels];
      }
      write(HOTELS_KEY, this.hotels);
    },
    isFlightFav(card: FlightCard, path: string) {
      const key = flightFavKey(card, path);
      return this.flights.some((f) => f.key === key);
    },
    toggleFlight(
      card: FlightCard,
      info: { fromCity: string; toCity: string; link: string },
    ) {
      this.load();
      const key = flightFavKey(card, info.link);
      if (this.flights.some((f) => f.key === key)) {
        this.flights = this.flights.filter((f) => f.key !== key);
      } else {
        const fav: FavFlight = {
          key,
          airline: card.airline,
          airlineCode: card.airlineCode,
          logoUrl: card.logoUrl,
          price: card.price,
          currency: card.currency,
          fromCity: info.fromCity,
          toCity: info.toCity,
          fromLine: `${card.out.fromCode} ${card.out.fromName}`.trim(),
          viaLine: card.out.via,
          toLine: `${card.out.toCode} ${card.out.toName}`.trim(),
          link: info.link,
        };
        this.flights = [fav, ...this.flights];
      }
      write(FLIGHTS_KEY, this.flights);
    },
    removeFlight(key: string) {
      this.flights = this.flights.filter((f) => f.key !== key);
      write(FLIGHTS_KEY, this.flights);
    },
  },
});
