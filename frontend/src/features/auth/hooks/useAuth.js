import { useContext, useEffect } from "react";
import { AuthContext  } from "../AuthContext";
import { login,register,logout,getme } from "../services/auth.api";


export const useAuth = () =>{
      const context = useContext(AuthContext);
     const { user, setUser, loading, setLoading } = context;

   const handleLogin = async ({ email, password }) => {
  setLoading(true);

  try {
    const data = await login({ email, password });
    setUser(data.user);
    return { success: true };
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
    setUser(data.user);
   return { success: true };
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
    setUser(null);
  } catch (error) {
     return { success: false, message: error.message };
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const checkAuth = async () => {
    try {
      const data = await getme();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    }
  };

  checkAuth();
}, []);
     return {user,loading,handleLogin,handleLogout,handleRegister}
}