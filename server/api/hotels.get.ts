// Proxy for LiteAPI GET /v3.0/data/hotels
// The API key stays on the server and never reaches the browser.

const ALLOWED_PARAMS = [
  "countryCode",
  "cityName",
  "hotelName",
  "offset",
  "limit",
  "longitude",
  "latitude",
  "radius",
  "minRating",
  "minReviewsCount",
  "facilityIds",
  "hotelTypeIds",
  "chainIds",
  "starRating",
  "placeId",
  "language",
  "hotelIds",
  "zip",
] as const;

export default defineEventHandler(async (event) => {
  const { liteapiKey } = useRuntimeConfig(event);
  if (!liteapiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_LITEAPI_KEY is not set",
    });
  }

  const query = getQuery(event);
  const params: Record<string, string> = {};
  for (const key of ALLOWED_PARAMS) {
    const value = query[key];
    if (typeof value === "string" && value !== "") params[key] = value;
  }
  params.limit ??= "20";

  try {
    return await $fetch("https://api.liteapi.travel/v3.0/data/hotels", {
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
