// src/components/Header.jsx
import React from "react";

export default function Header({
  title,
  userData,
  isUserAdmin,
  loading,
  onRefresh,
  onLogout,
}) {
  return (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <h1 style={styles.title}>
          {isUserAdmin ? "🛠️ Panel de Administración" : "🛍️ Tienda Virtual"}
        </h1>
        <div style={styles.userInfo}>
          <span style={styles.welcomeText}>Hola, {userData?.name}</span>
          <div style={styles.userBadges}>
            {userData?.roles?.map((role, index) => (
              <span
                key={index}
                style={{
                  ...styles.roleBadge,
                  ...(role === "admin"
                    ? styles.adminBadge
                    : styles.userBadge),
                }}
              >
                {role}
                {role === "admin" && " 👑"}
              </span>
            ))}
          </div>

          <button
            style={styles.refreshBtn}
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "🔄 Cargando..." : "🔄 Recargar"}
          </button>

          <button style={styles.logoutBtn} onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "4rem",
    backgroundColor: "#3b82f6",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    color: "white",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  welcomeText: {
    fontWeight: "bold",
    color: "white",
  },
  userBadges: {
    display: "flex",
    gap: "0.5rem",
  },
  roleBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "1rem",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  adminBadge: {
    backgroundColor: "#dc2626",
    color: "white",
  },
  userBadge: {
    backgroundColor: "#16a34a",
    color: "white",
  },
  refreshBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "500",
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "500",
  },
};
