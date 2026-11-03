import type { H3Event } from "h3";

const BASE_URL = "https://api.liteapi.travel/v3.0";

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

export async function liteapi(
  event: H3Event,
  path: string,
  query: Record<string, string> = {},
  options: { cache?: boolean; body?: Record<string, unknown> } = {},
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
      method: options.body ? "POST" : "GET",
      headers: { "X-API-Key": liteapiKey, accept: "application/json" },
      query,
      body: options.body,
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
