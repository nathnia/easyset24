import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/icon", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    liteapiKey: "",
    public: {
      // "sandbox" for test payments, "live" for real money
      liteapiPaymentEnv: "sandbox",
    },
  },

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
