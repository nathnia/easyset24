// POST /rates/book: confirm the booking after the payment SDK took the money
import { liteapi, BOOK_URL } from "../utils/liteapi-proxy";

const PER_ROOM = 2;
const text = (v: unknown, max = 100) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {};
  const prebookId = text(body.prebookId, 200);
  const transactionId = text(body.transactionId, 200);
  const firstName = text(body.holder?.firstName);
  const lastName = text(body.holder?.lastName);
  const email = text(body.holder?.email, 200);
  const phone = text(body.holder?.phone, 30).replace(/[^\d+]/g, "");
  const remarks = text(body.remarks, 500);
  const adults = Number(body.adults);

  if (!prebookId || !transactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "prebookId and transactionId are required",
    });
  }
  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Guest name and a valid email are required",
    });
  }
  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    throw createError({
      statusCode: 400,
      statusMessage: "adults must be 1 to 9",
    });
  }

  // Same room split as rates (5 adults -> 3 rooms). Main guest is listed on every room.
  const rooms = Math.ceil(adults / PER_ROOM);
  const guests = Array.from({ length: rooms }, (_, i) => ({
    occupancyNumber: i + 1,
    firstName,
    lastName,
    email,
    ...(remarks ? { remarks } : {}),
  }));

  return liteapi(
    event,
    "/rates/book",
    {},
    {
      base: BOOK_URL,
      body: {
        prebookId,
        holder: { firstName, lastName, email, ...(phone ? { phone } : {}) },
        payment: { method: "TRANSACTION_ID", transactionId },
        guests,
      },
    },
  );
});
