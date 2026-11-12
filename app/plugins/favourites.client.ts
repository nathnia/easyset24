import { useFavouritesStore } from "~/stores/favourites";

// read the saved favourites after hydration, so the first render matches the server
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    useFavouritesStore().load();
  });
});
