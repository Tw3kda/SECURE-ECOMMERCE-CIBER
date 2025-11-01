// src/pages/private/Dashboard.jsx
import React from "react";
import { getKeycloak } from "../../keycloak";

export default function Dashboard() {
  const keycloak = getKeycloak();

  const handleLogout = () => {
    // 👇 Redirects user to Keycloak’s logout endpoint
    keycloak.logout({
      redirectUri: window.location.origin, // after logout, return to your homepage
    });
  };

  return (
    <div style={styles.container}>
      <h1>Dashboard</h1>
      <p>Welcome, {keycloak?.tokenParsed?.preferred_username || "User"}!</p>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
    gap: "1rem",
  },
  logoutBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#e63946",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
};
