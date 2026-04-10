import { useContext } from "react";
import { AUTH_SESSION_KEY, AuthContext  } from "../AuthContext";
import { login,register,logout,getme } from "../services/auth.api";


export const useAuth = () =>{
      const context = useContext(AuthContext);
     const { user, setUser, loading, setLoading } = context;

   const handleLogin = async ({ email, password }) => {
  setLoading(true);

  try {
    const data = await login({ email, password });
    const user = data?.data?.user;

    if (!user) {
      return { success: false, message: "User data not found" };
    }

    localStorage.setItem(AUTH_SESSION_KEY, "true");
    setUser(user);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async ({ username, email, password }) => {
  setLoading(true);
  try {
    const data = await register({ username, email, password });
    const user = data?.data?.user;

    if (!user) {
      return { success: false, message: "User data not found" };
    }

    localStorage.setItem(AUTH_SESSION_KEY, "true");
    setUser(user);
   return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};
      const handleLogout = async () => {
  setLoading(true);
  try {
    await logout();
    localStorage.removeItem(AUTH_SESSION_KEY);
    setUser(null);
  } catch (error) {
     return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};

const handlegetme = async ()=>{
    setLoading(true);
    try {
      const data = await getme();
      const user = data?.data?.user;

      if (!user) {
        localStorage.removeItem(AUTH_SESSION_KEY);
        setUser(null);
        return { success: false, message: "User data not found" };
      }

      localStorage.setItem(AUTH_SESSION_KEY, "true");
      setUser(user);
      return { success: true, user };
    } catch (error) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      setUser(null);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }

     return {user,loading,handleLogin,handleLogout,handleRegister,handlegetme}
}
