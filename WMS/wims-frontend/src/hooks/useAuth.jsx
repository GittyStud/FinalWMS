import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

// Persistent Axios Instance
// defined outside component to prevent recreation on re-renders
const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize User State from LocalStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (e) {
        console.error("Failed to parse user data", e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // 2. Login Function
  const logIn = async (username, password) => {
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return true;
      }
      return false;
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed.";
      throw new Error(msg);
    }
  };

  // 3. Logout Function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  // 4. Authenticated Fetch Wrapper
  // Handles both axios-style 'data' and fetch-style 'body' for compatibility
  const authFetch = useCallback(
    async (endpoint, options = {}) => {
      // Adapter: If 'body' is passed (fetch style), convert to 'data' (axios style)
      if (options.body && !options.data) {
        try {
          options.data =
            typeof options.body === "string"
              ? JSON.parse(options.body)
              : options.body;
        } catch (e) {
          options.data = options.body;
        }
      }

      try {
        const res = await api(endpoint, options);
        return res.data;
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          throw new Error("Session expired. Please log in again.");
        }
        // Return specific backend error message if available
        const message =
          error.response?.data?.message || error.message || "API Error";
        throw new Error(message);
      }
    },
    [logout]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      logIn,
      logout,
      authFetch,
    }),
    [user, loading, logout, authFetch]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
