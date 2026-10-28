export interface AuthUser {
  name: string;
  email: string;
  avatar: string;
}

export const useAuth = () => {
  const user = useCookie<AuthUser | null>("easyset_user", {
    default: () => null,
  });
  const isLoggedIn = computed(() => !!user.value);

  const signIn = (u: AuthUser) => {
    user.value = u;
  };
  const signOut = () => {
    user.value = null;
  };

  return { user, isLoggedIn, signIn, signOut };
};
