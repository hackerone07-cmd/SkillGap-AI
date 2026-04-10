import { createContext, useEffect, useState } from "react";
import { getme } from "./services/auth.api";

export const AuthContext = createContext();
export const AUTH_SESSION_KEY = "auth_session_active";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const hasSessionHint = localStorage.getItem(AUTH_SESSION_KEY) === "true";

      if (!hasSessionHint) {
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
        localStorage.removeItem(AUTH_SESSION_KEY);
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
