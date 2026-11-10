// GET /data/iataCodes: airport and city codes (static data)
import { liteapi } from "../utils/liteapi-proxy";

export default defineEventHandler((event) =>
  liteapi(event, "/data/iataCodes", {}, { cache: true }),
);
