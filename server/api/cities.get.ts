import { liteapi, pickQuery } from "../utils/liteapi-proxy";
export default defineEventHandler((event) =>
  liteapi(
    event,
    "/data/cities",
    pickQuery(event, ["countryCode"], ["countryCode"]),
    { cache: true },
  ),
);
