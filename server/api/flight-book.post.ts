// POST /flights/bookings: confirm the flight after the payment SDK took the money
import { liteapi } from "../utils/liteapi-proxy";

const text = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {};
  const prebookId = text(body.prebookId);
  const transactionId = text(body.transactionId);

  if (!prebookId || !transactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "prebookId and transactionId are required",
    });
  }

  return liteapi(
    event,
    "/flights/bookings",
    {},
    {
      body: { prebookId, payment: { method: "TRANSACTION_ID", transactionId } },
    },
  );
});
