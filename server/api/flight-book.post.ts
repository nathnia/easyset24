import { liteapi } from "../utils/liteapi-proxy";
import { text } from "../utils/validate";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {};
  const prebookId = text(body.prebookId, 200);
  const transactionId = text(body.transactionId, 200);

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
