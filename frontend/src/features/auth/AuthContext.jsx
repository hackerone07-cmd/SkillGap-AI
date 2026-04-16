import { useEffect, useState } from "react";
import { getme } from "./services/auth.api";
import { AUTH_TOKEN_KEY } from "./auth.constants";
import { AuthContext } from "./auth.context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const data = await getme();
        const user = data?.data?.user;

        if (isMounted) {
          setUser(user ?? null);
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isInitializing,
        setIsInitializing,
        isAuthenticating,
        setIsAuthenticating,
        loading: isInitializing || isAuthenticating,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
