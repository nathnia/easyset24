// Proxy for LiteAPI GET /v3.0/data/reviews (guest reviews of one hotel)

export default defineEventHandler(async (event) => {
  const { liteapiKey } = useRuntimeConfig(event);
  if (!liteapiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_LITEAPI_KEY is not set",
    });
  }

  const query = getQuery(event);
  if (typeof query.hotelId !== "string" || !query.hotelId) {
    throw createError({
      statusCode: 400,
      statusMessage: "hotelId is required",
    });
  }

  const params: Record<string, string> = { hotelId: query.hotelId };
  for (const key of ["limit", "offset", "language", "getSentiment"] as const) {
    const value = query[key];
    if (typeof value === "string" && value !== "") params[key] = value;
  }
  params.limit ??= "10";

  try {
    return await $fetch("https://api.liteapi.travel/v3.0/data/reviews", {
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
