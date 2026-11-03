// GET /data/hotels: list of hotels
import { liteapi, pickQuery } from "../utils/liteapi-proxy";
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

export default defineEventHandler((event) =>
  liteapi(event, "/data/hotels", { limit: "20", ...pickQuery(event, PARAMS) }),
);
