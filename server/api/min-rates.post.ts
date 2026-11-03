import { liteapi } from "../utils/liteapi-proxy";

const CURRENCY = "USD";
const NATIONALITY = "ID";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PER_ROOM = 2;

export default defineEventHandler(async (event) => {
  const { hotelIds, checkin, checkout, adults } = (await readBody(event)) ?? {};

  if (
    !Array.isArray(hotelIds) ||
    !hotelIds.length ||
    hotelIds.length > 200 ||
    !hotelIds.every((id) => typeof id === "string")
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "hotelIds is required",
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

  // Split guests across rooms of up to 2 adults (5 adults -> 2 + 2 + 1)
  const rooms = Math.ceil(guests / PER_ROOM);
  const occupancies = Array.from({ length: rooms }, (_, i) => ({
    adults: i < rooms - 1 ? PER_ROOM : guests - PER_ROOM * (rooms - 1),
  }));

  return liteapi(
    event,
    "/hotels/min-rates",
    {},
    {
      body: {
        hotelIds,
        occupancies,
        checkin,
        checkout,
        currency: CURRENCY,
        guestNationality: NATIONALITY,
        timeout: 8,
      },
    },
  );
});
