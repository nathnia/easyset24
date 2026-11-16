import { liteapi, pickQuery } from "../utils/liteapi-proxy";
import { clampInt } from "../utils/validate";
const PARAMS = [
  "countryCode",
  "cityName",
  "hotelName",
  "offset",
  "limit",
  "longitude",
  "latitude",
  "radius",
  "minRating",
  "minReviewsCount",
  "facilityIds",
  "strictFacilitiesFiltering",
  "hotelTypeIds",
  "chainIds",
  "starRating",
  "placeId",
  "language",
  "hotelIds",
  "zip",
];

export default defineEventHandler((event) => {
  const params = pickQuery(event, PARAMS);
  params.limit = String(clampInt(params.limit, 1, 50, 20));
  if (params.offset)
    params.offset = String(clampInt(params.offset, 0, 10000, 0));
  for (const key of ["facilityIds", "hotelIds", "hotelTypeIds", "chainIds"]) {
    if (params[key] && params[key].length > 500) {
      throw createError({
        statusCode: 400,
        statusMessage: `${key} is too long`,
      });
    }
  }
  return liteapi(event, "/data/hotels", params);
});
