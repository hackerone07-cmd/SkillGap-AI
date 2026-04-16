import { useContext } from "react";
import { AuthContext  } from "../auth.context";
import { AUTH_TOKEN_KEY } from "../auth.constants";
import { login,register,logout,getme } from "../services/auth.api";


export const useAuth = () =>{
      const context = useContext(AuthContext);
     const {
      user,
      setUser,
      loading,
      isInitializing,
      isAuthenticating,
      setIsAuthenticating,
     } = context;

   const handleLogin = async ({ email, password }) => {
  setIsAuthenticating(true);

  try {
    const data = await login({ email, password });
    const user = data?.data?.user;
    const token = data?.data?.token;

    if (!user || !token) {
      return { success: false, message: "User data not found" };
    }

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(user);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    setIsAuthenticating(false);
  }
};

  const handleRegister = async ({ username, email, password }) => {
  setIsAuthenticating(true);
  try {
    const data = await register({ username, email, password });
    const user = data?.data?.user;
    const token = data?.data?.token;

    if (!user || !token) {
      return { success: false, message: "User data not found" };
    }

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(user);
   return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    setIsAuthenticating(false);
  }
};
      const handleLogout = async () => {
  setIsAuthenticating(true);
  try {
    await logout();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    return { success: true };
  } catch (error) {
     return { success: false, message: error.message };
  } finally {
    setIsAuthenticating(false);
  }
};

const handlegetme = async ()=>{
    setIsAuthenticating(true);
    try {
      const data = await getme();
      const user = data?.data?.user;

      if (!user) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        return { success: false, message: "User data not found" };
      }

      setUser(user);
      return { success: true, user };
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      return { success: false, message: error.message };
    } finally {
      setIsAuthenticating(false);
    }
  }

     return {
      user,
      loading,
      isInitializing,
      isAuthenticating,
      handleLogin,
      handleLogout,
      handleRegister,
      handlegetme,
     }
}
