import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>Welcome to Secure Ecommerce</h1>
      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => navigate("/login")}>
          Login
        </button>
        <button style={styles.button} onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
    background: "#f0f0f0",
    fontFamily: "sans-serif",
  },
  buttons: {
    display: "flex",
    gap: "1rem",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    background: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    transition: "background 0.3s",
  },
};
