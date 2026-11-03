// GET /data/cities: cities of one country (static data)
import { liteapi, pickQuery } from "../utils/liteapi-proxy";
// GET /data/cities: cities of one country (static data)
export default defineEventHandler((event) =>
  liteapi(
    event,
    "/data/cities",
    pickQuery(event, ["countryCode"], ["countryCode"]),
    { cache: true },
  ),
);
