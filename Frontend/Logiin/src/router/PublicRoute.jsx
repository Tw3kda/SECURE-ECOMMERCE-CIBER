import React from "react";
import { Navigate } from "react-router-dom";
import { keycloak } from "../keycloak";

export default function PublicRoute({ children }) {
  if (keycloak.authenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
