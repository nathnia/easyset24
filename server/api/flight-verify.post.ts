// POST /flights/verify: confirm an offer is still available + latest price
import { liteapi } from "../utils/liteapi-proxy";

export default defineEventHandler(async (event) => {
  const { offerId } = (await readBody(event)) ?? {};

  if (
    typeof offerId !== "string" ||
    offerId.length < 10 ||
    offerId.length > 2000 ||
    !/^[A-Za-z0-9+/=_-]+$/.test(offerId)
  ) {
    throw createError({ statusCode: 400, statusMessage: "Invalid offerId" });
  }

  return liteapi(event, "/flights/verify", {}, { body: { offerId } });
});