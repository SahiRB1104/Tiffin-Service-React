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
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api.get("/user/profile");
        setUser(data);
      } catch {
        handleLocalLogout();
      } finally {
        setLoading(false);
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
