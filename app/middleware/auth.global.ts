const protectedPaths = [
  "/profile",
  "/hotel-reservation",
  "/hotel-payment",
  "/hotel-favourites",
  "/flight-favourites",
  "/flight-payment",
  "/flight-ticket",
  "/setting",
  "/payment",
  "/preferences",
  "/profile-basic-information",
  "/profile-mandatory-information",
  "/tracking-reservation",
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
