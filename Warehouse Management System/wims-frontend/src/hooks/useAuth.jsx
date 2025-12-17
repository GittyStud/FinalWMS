import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// --- Configuration ---
// Note: In a production environment, this should be read from .env variables.
const API_BASE_URL = "http://localhost:3001/api";

// 1. Create the Context
const AuthContext = createContext(null);

// 2. AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // --- Core Authentication Functions ---

  /**
   * Logs a user into the system, stores the token, and sets the user state.
   */
  const logIn = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
  }, []);

  /**
   * Logs a user out, clears local storage, and resets state.
   */
  const logOut = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page
  }, []);

  // --- API Fetch Wrapper (with Auth) ---

  /**
   * Returns a memoized function for making authenticated API requests.
   * Ensures the token is passed in the header and handles unauthorized responses.
   */
  const useAuthFetch = useCallback(() => {
    return async (endpoint, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config = {
        ...options,
        headers,
      };

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
          // Token expired, invalid, or user unauthorized
          logOut(); // Clear session and redirect
          return {
            success: false,
            message: "Session expired or unauthorized.",
          };
        }

        return response;
      } catch (error) {
        console.error("Fetch error:", error);
        // Handle network errors (e.g., server offline)
        return {
          success: false,
          message: "Network error. Please check the server connection.",
        };
      }
    };
  }, [token, logOut]); // Recreates if token or logOut changes

  // --- Initial Check (Load user from token) ---

  // Fetches user data using the token stored in localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const authFetch = useAuthFetch(); // Get the fetch function instance

      try {
        // Ping the server to validate the token and get user details
        const response = await authFetch("/auth/me");

        // This is a special endpoint that just returns the user object if the token is valid
        if (response && response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            // Token was invalid but not caught by 401/403 status (e.g., 500 server error)
            logOut();
          }
        } else if (
          response &&
          response.status !== 401 &&
          response.status !== 403
        ) {
          // Handle other non-auth errors if necessary
          logOut();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        logOut();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, useAuthFetch]); // Dependency array: run once on mount or when token changes

  // --- Memoized Context Value ---

  const contextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      logIn,
      logOut,
      useAuthFetch: useAuthFetch(), // Expose the function instance
    }),
    [user, token, loading, logIn, logOut, useAuthFetch]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// 3. useAuth Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
