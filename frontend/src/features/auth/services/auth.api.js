import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

async function logout() {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

async function getme() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export {
  login,
  register,
  getme,
  logout,
};
