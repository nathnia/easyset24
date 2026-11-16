import type { H3Event } from "h3";

export function requireUser(event: H3Event) {
  try {
    const user = JSON.parse(getCookie(event, "easyset_user") ?? "");
    if (user && typeof user.email === "string" && user.email) {
      return user.email as string;
    }
  } catch {}
  throw createError({ statusCode: 401, statusMessage: "Please sign in" });
}
