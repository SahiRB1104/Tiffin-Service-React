import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync state when localStorage changes
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("access_token");
      setToken(newToken);
      if (!newToken) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api.get("/user/profile");
        setUser(data);
        setLoading(false);
      } catch (error) {
        // Only logout on 401 (unauthorized), not on other errors
        if (error?.response?.status === 401) {
          handleLocalLogout();
        } else {
          // For other errors, keep token but don't load user data
          setLoading(false);
        }
      }
    };

    fetchProfile();

    const onAuthError = () => handleLocalLogout();
    window.addEventListener("auth-error", onAuthError);
    return () =>
      window.removeEventListener("auth-error", onAuthError);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    setLoading(true);
  };

  const handleLocalLogout = () => {
    localStorage.removeItem("access_token");
    // Clear cart data on logout
    localStorage.removeItem("cartData");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore backend failure
    } finally {
      handleLocalLogout();
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      setUser,
      loading,
      login,
      logout,
      isAuthenticated: !!token,
    }),
    [token, user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be inside AuthProvider");
  }
  return ctx;
};
