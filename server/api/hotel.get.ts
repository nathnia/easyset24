// GET /data/hotel: details of one hotel
import { liteapi, pickQuery } from "../utils/liteapi-proxy";
export default defineEventHandler((event) =>
  liteapi(
    event,
    "/data/hotel",
    pickQuery(event, ["hotelId", "language"], ["hotelId"]),
  ),
);
