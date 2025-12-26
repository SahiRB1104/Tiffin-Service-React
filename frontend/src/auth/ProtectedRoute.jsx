import React from "react";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : fallback;
};
