import { liteapi, pickQuery } from "../utils/liteapi-proxy";

export default defineEventHandler((event) => {
  const params = pickQuery(event, ["q"], ["q"]);
  if (params.q!.trim().length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "q must be at least 2 characters",
    });
  }
  return liteapi(
    event,
    "/data/flights/airports",
    { q: params.q!.trim() },
    { cache: true },
  );
});
