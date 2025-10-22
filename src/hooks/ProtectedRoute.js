// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("jwt");
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
