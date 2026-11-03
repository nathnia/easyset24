// GET /data/reviews: guest reviews of one hotel
import { liteapi, pickQuery } from "../utils/liteapi-proxy";
const PARAMS = ["hotelId", "limit", "offset", "language", "getSentiment"];

export default defineEventHandler((event) =>
  liteapi(event, "/data/reviews", {
    limit: "10",
    ...pickQuery(event, PARAMS, ["hotelId"]),
  }),
);
