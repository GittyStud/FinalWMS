// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Import the hook
import { Package } from "lucide-react"; // Re-using the icon from App.jsx's logic

// Note: LoginPage component logic is pulled from the old App.jsx file
const LoginPage = () => {
  const { login, API_BASE_URL } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            setError(
              errorData.message || `Login failed: HTTP ${response.status}`
            );
          } catch (jsonError) {
            setError(
              `Server returned status ${response.status}. Check backend logs.`
            );
          }
          break;
        }

        const data = await response.json();

        if (data.success) {
          // Use the login function from the hook
          login(data.user, data.token);
          return;
        } else {
          setError(
            data.message || "Login failed due to unexpected server response."
          );
          break;
        }
      } catch (err) {
        if (attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        } else {
          setError(
            "Server connection failed. Please ensure the backend is running on port 3001."
          );
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
      <div className="flex justify-center mb-6">
        <Package className="w-12 h-12 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
        WMS Login
      </h2>
      <p className="text-center text-sm text-gray-500 mb-8">
        Sign in to manage your inventory and users.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        {error && (
          <div
            className="p-3 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
