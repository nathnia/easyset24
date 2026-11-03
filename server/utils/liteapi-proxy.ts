// Shared helpers for the LiteAPI proxy routes in server/api/* (named liteapi-proxy.ts so it never clashes with app/utils/liteapi.ts)
// (auto-imported by Nitro: use liteapi() and pickQuery() directly in a route)
import type { H3Event } from "h3";

const BASE_URL = "https://api.liteapi.travel/v3.0";

// Copy only the allowed query params the browser sent. Throws 400 if a required one is missing.
export function pickQuery(
  event: H3Event,
  allowed: readonly string[],
  required: readonly string[] = [],
) {
  const query = getQuery(event);
  const params: Record<string, string> = {};
  for (const key of allowed) {
    const value = query[key];
    if (typeof value === "string" && value !== "") params[key] = value;
  }
  for (const key of required) {
    if (!params[key]) {
      throw createError({
        statusCode: 400,
        statusMessage: `${key} is required`,
      });
    }
  }
  return params;
}

// GET {BASE_URL}{path} with the secret key added on the server (never sent to the browser).
// cache: true for static data (countries, cities, facilities): browsers keep it for a day.
export async function liteapi(
  event: H3Event,
  path: string,
  query: Record<string, string> = {},
  options: { cache?: boolean } = {},
) {
  const { liteapiKey } = useRuntimeConfig(event);
  if (!liteapiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_LITEAPI_KEY is not set",
    });
  }

  try {
    const data = await $fetch(`${BASE_URL}${path}`, {
      headers: { "X-API-Key": liteapiKey, accept: "application/json" },
      query,
    });
    if (options.cache)
      setHeader(event, "cache-control", "public, max-age=86400");
    return data;
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 502,
      statusMessage:
        e?.data?.error?.message || e?.statusMessage || "LiteAPI request failed",
    });
  }
}
