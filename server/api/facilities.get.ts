import { liteapi } from "../utils/liteapi-proxy";
export default defineEventHandler((event) =>
  liteapi(event, "/data/facilities", {}, { cache: true }),
);
