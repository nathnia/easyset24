// Proxy for LiteAPI GET /v3.0/data/cities (cities of one country, static data)

export default defineEventHandler(async (event) => {
  const { liteapiKey } = useRuntimeConfig(event);
  if (!liteapiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_LITEAPI_KEY is not set",
    });
  }

  const { countryCode } = getQuery(event);
  if (typeof countryCode !== "string" || !countryCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "countryCode is required",
    });
  }

  try {
    const data = await $fetch("https://api.liteapi.travel/v3.0/data/cities", {
      headers: { "X-API-Key": liteapiKey, accept: "application/json" },
      query: { countryCode },
    });
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
