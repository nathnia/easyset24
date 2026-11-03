// GET /data/facilities: all hotel facilities (static data)
import { liteapi, pickQuery } from "../utils/liteapi-proxy";
export default defineEventHandler((event) =>
  liteapi(event, "/data/facilities", {}, { cache: true }),
);
