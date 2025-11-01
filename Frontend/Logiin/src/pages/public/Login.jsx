import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKeycloak } from "../../keycloak";

export default function Login() {
  const keycloak = getKeycloak();
  const [authenticated, setAuthenticated] = useState(keycloak.authenticated);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ If already authenticated, go straight to dashboard
    if (keycloak.authenticated) {
      navigate("/dashboard");
    } else {
      // ✅ Otherwise trigger Keycloak login automatically
      keycloak.login({
        redirectUri: `${window.location.origin}/dashboard`,
      });
    }
  }, [keycloak, navigate]);

  return (
    <div style={styles.container}>
      <h2>Redirecting to Keycloak...</h2>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
};
