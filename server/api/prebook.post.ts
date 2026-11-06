// POST /rates/prebook: lock an offer and get the payment SDK keys
import { liteapi, BOOK_URL } from "../utils/liteapi-proxy";

export default defineEventHandler(async (event) => {
  const { offerId } = (await readBody(event)) ?? {};
  if (typeof offerId !== "string" || !offerId.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "offerId is required",
    });
  }

  return liteapi(
    event,
    "/rates/prebook",
    {},
    { base: BOOK_URL, body: { offerId, usePaymentSdk: true } },
  );
});
