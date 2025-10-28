import React, { useEffect } from "react";
import { keycloak } from "../../keycloak";

export default function Login() {
  useEffect(() => {
    // Redirige inmediatamente a Keycloak
    keycloak.login();
  }, []);

  return (
    <div style={styles.container}>
      <p>Redirecting to Keycloak login...</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.2rem",
    fontFamily: "sans-serif",
  },
};
