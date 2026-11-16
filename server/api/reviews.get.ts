import { liteapi, pickQuery } from "../utils/liteapi-proxy";
import { clampInt } from "../utils/validate";
const PARAMS = ["hotelId", "limit", "offset", "language", "getSentiment"];

export default defineEventHandler((event) => {
  const params = pickQuery(event, PARAMS, ["hotelId"]);
  params.limit = String(clampInt(params.limit, 1, 50, 10));
  if (params.offset)
    params.offset = String(clampInt(params.offset, 0, 10000, 0));
  return liteapi(event, "/data/reviews", params);
});
