import { requireUser } from "../utils/auth";
import { liteapi } from "../utils/liteapi-proxy";

export default defineEventHandler(async (event) => {
  requireUser(event);
  const body = (await readBody(event)) ?? {};
  const id = String(body.id ?? "");
  if (!/^[\w-]{3,64}$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid booking id" });
  }
  return liteapi(
    event,
    `/flights/bookings/${id}/cancellations`,
    {},
    { method: "POST" },
  );
});
