// GET /bookings/{id}: read one booking
import { liteapi, BOOK_URL } from "../utils/liteapi-proxy";

export default defineEventHandler(async (event) => {
  const id = String(getQuery(event).id ?? "");
  if (!/^[\w-]{3,64}$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid booking id" });
  }
  return liteapi(event, `/bookings/${id}`, {}, { base: BOOK_URL });
});
