import { liteapi } from "../utils/liteapi-proxy";
import { DATE, occupancies } from "../utils/validate";

const CURRENCY = "USD";
const NATIONALITY = "ID";

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

  return liteapi(
    event,
    "/hotels/rates",
    {},
    {
      body: {
        hotelIds: [hotelId],
        occupancies: occupancies(guests),
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
