import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/4.x/api/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/icon"],

  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "EasySet 24",
      titleTemplate: "%s - EasySet24",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
