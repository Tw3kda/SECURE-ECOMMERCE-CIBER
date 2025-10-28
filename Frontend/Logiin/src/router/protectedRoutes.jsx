import React from "react";
import { Navigate } from "react-router-dom";
import { keycloak } from "../keycloak";

export default function ProtectedRoutes({ children }) {
  if (!keycloak.authenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
