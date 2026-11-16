import { liteapi } from "../utils/liteapi-proxy";
import { DATE, occupancies } from "../utils/validate";

const CURRENCY = "USD";
const NATIONALITY = "ID";

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

  return liteapi(
    event,
    "/hotels/min-rates",
    {},
    {
      body: {
        hotelIds,
        occupancies: occupancies(guests),
        checkin,
        checkout,
        currency: CURRENCY,
        guestNationality: NATIONALITY,
        timeout: 8,
      },
    },
  );
});
