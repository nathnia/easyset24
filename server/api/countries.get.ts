// Proxy for LiteAPI GET /v3.0/data/countries (all countries, static data)

export default defineEventHandler(async (event) => {
  const { liteapiKey } = useRuntimeConfig(event);
  if (!liteapiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_LITEAPI_KEY is not set",
    });
  }

  try {
    const data = await $fetch(
      "https://api.liteapi.travel/v3.0/data/countries",
      {
        headers: { "X-API-Key": liteapiKey, accept: "application/json" },
      },
    );
    setHeader(event, "cache-control", "public, max-age=86400"); // static data
    return data;
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 502,
      statusMessage:
        e?.data?.error?.message || e?.statusMessage || "LiteAPI request failed",
    });
  }
});
