import { createContext, useEffect, useState } from "react";
import { getme } from "./services/auth.api";
import { AUTH_TOKEN_KEY } from "./auth.constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        if (isMounted) {
          setLoading(false);
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
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
