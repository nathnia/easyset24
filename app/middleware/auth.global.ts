const protectedPaths = [
  "/profile",
  "/hotels/reservation",
  "/hotels/payment",
  "/hotels/favourites",
  "/flights/payment",
  "/flights/ticket",
  "/flights/favourites",
  "/setting",
  "/payment",
  "/preferences",
  "/tracking-registration",
];
const guestOnlyPaths = ["/login", "/register"];

const matches = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(`${p}/`));

export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn.value && matches(to.path, protectedPaths)) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (isLoggedIn.value && matches(to.path, guestOnlyPaths)) {
    return navigateTo("/");
  }
});
