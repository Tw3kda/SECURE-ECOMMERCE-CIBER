import React from "react";
import { Navigate } from "react-router-dom";
import { getKeycloak } from "../keycloak";

export default function PublicRoute({ children }) {
  const keycloak = getKeycloak();
  if (keycloak.authenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
