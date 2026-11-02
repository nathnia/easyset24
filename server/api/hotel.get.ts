// Proxy for LiteAPI GET /v3.0/data/hotel (details of one hotel)

export default defineEventHandler(async (event) => {
  const { liteapiKey } = useRuntimeConfig(event);
  if (!liteapiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_LITEAPI_KEY is not set",
    });
  }

  const { hotelId, language } = getQuery(event);
  if (typeof hotelId !== "string" || !hotelId) {
    throw createError({
      statusCode: 400,
      statusMessage: "hotelId is required",
    });
  }

  const params: Record<string, string> = { hotelId };
  if (typeof language === "string" && language) params.language = language;

  try {
    return await $fetch("https://api.liteapi.travel/v3.0/data/hotel", {
      headers: { "X-API-Key": liteapiKey, accept: "application/json" },
      query: params,
    });
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 502,
      statusMessage:
        e?.data?.error?.message || e?.statusMessage || "LiteAPI request failed",
    });
  }
});
