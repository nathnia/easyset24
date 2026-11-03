// POST /hotels/rates: room offers for one hotel
import { liteapi } from "../utils/liteapi-proxy";

const CURRENCY = "USD";
const NATIONALITY = "ID";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PER_ROOM = 2;

export default defineEventHandler(async (event) => {
  const { hotelId, checkin, checkout, adults } = (await readBody(event)) ?? {};

  if (typeof hotelId !== "string" || !hotelId) {
    throw createError({
      statusCode: 400,
      statusMessage: "hotelId is required",
    });
  }
  if (!DATE.test(String(checkin)) || !DATE.test(String(checkout))) {
    throw createError({
      statusCode: 400,
      statusMessage: "checkin and checkout must be YYYY-MM-DD",
    });
  }
  const guests = Number(adults);
  if (!Number.isInteger(guests) || guests < 1 || guests > 9) {
    throw createError({
      statusCode: 400,
      statusMessage: "adults must be 1 to 9",
    });
  }

  // Same room split as min-rates (5 adults -> 2 + 2 + 1)
  const rooms = Math.ceil(guests / PER_ROOM);
  const occupancies = Array.from({ length: rooms }, (_, i) => ({
    adults: i < rooms - 1 ? PER_ROOM : guests - PER_ROOM * (rooms - 1),
  }));

  return liteapi(
    event,
    "/hotels/rates",
    {},
    {
      body: {
        hotelIds: [hotelId],
        occupancies,
        checkin,
        checkout,
        currency: CURRENCY,
        guestNationality: NATIONALITY,
        roomMapping: true,
        timeout: 8,
      },
    },
  );
});
