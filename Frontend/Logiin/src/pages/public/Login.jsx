import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKeycloak } from "../../keycloak";

export default function Login() {
  const keycloak = getKeycloak();
  const [authenticated, setAuthenticated] = useState(keycloak.authenticated);
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
    tokenParsed: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      // ✅ If already authenticated, go straight to dashboard
      if (keycloak.authenticated) {
        console.log("🔑 Usuario ya autenticado, redirigiendo...");
        printTokens(keycloak);
        setTokens({
          accessToken: keycloak.token,
          refreshToken: keycloak.refreshToken,
          tokenParsed: keycloak.tokenParsed,
        });
        navigate("/dashboard");
      } else {
        console.log("🔐 Usuario no autenticado, iniciando login...");

        // ✅ Otherwise trigger Keycloak login automatically
        try {
          await keycloak.login({
            redirectUri: `${window.location.origin}/dashboard`,
          });
        } catch (error) {
          console.error("❌ Error durante login:", error);
        }
      }
    };

    initializeAuth();
  }, [keycloak, navigate]);

  // Función para imprimir los tokens en consola
  const printTokens = (keycloakInstance) => {
    console.log("=".repeat(60));
    console.log("🔑 KEYCLOAK TOKENS INFORMATION");
    console.log("=".repeat(60));

    console.log("✅ Authenticated:", keycloakInstance.authenticated);
    console.log(
      "👤 Username:",
      keycloakInstance.tokenParsed?.preferred_username
    );
    console.log("🎯 Roles:", keycloakInstance.tokenParsed?.realm_access?.roles);

    // Access Token
    console.log("\n📄 ACCESS TOKEN:");
    console.log("🔐 Token:", keycloakInstance.token ? "PRESENTE" : "AUSENTE");
    if (keycloakInstance.token) {
      console.log("📏 Length:", keycloakInstance.token.length, "characters");
      console.log(
        "📋 Token (first 100 chars):",
        keycloakInstance.token.substring(0, 100) + "..."
      );

      // Decodificar el token para ver el payload
      try {
        const payload = JSON.parse(atob(keycloakInstance.token.split(".")[1]));
        console.log("🎫 Token Payload:", {
          exp: new Date(payload.exp * 1000).toLocaleString(),
          iat: new Date(payload.iat * 1000).toLocaleString(),
          iss: payload.iss,
          sub: payload.sub,
          preferred_username: payload.preferred_username,
          roles: payload.realm_access?.roles,
        });
      } catch (e) {
        console.log("❌ No se pudo decodificar el token");
      }
    }

    // Refresh Token
    console.log("\n🔄 REFRESH TOKEN:");
    console.log(
      "🔐 Token:",
      keycloakInstance.refreshToken ? "PRESENTE" : "AUSENTE"
    );
    if (keycloakInstance.refreshToken) {
      console.log(
        "📏 Length:",
        keycloakInstance.refreshToken.length,
        "characters"
      );
      console.log(
        "📋 Token (first 50 chars):",
        keycloakInstance.refreshToken.substring(0, 50) + "..."
      );
    }

    // Información adicional
    console.log("\n📊 ADDITIONAL INFO:");
    console.log("⏰ Token Expired?", keycloakInstance.isTokenExpired());
    console.log(
      "🕒 Min Validity:",
      keycloakInstance.tokenParsed?.exp
        ? `Expira en ${Math.round(
            (keycloakInstance.tokenParsed.exp * 1000 - Date.now()) / 1000
          )} segundos`
        : "No disponible"
    );
    console.log("🌐 Realm:", keycloakInstance.realm);
    console.log("🔧 Client ID:", keycloakInstance.clientId);

    console.log("=".repeat(60));
  };

  // Función para copiar token al clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`✅ ${type} copiado al portapapeles`);
      })
      .catch((err) => {
        console.error("Error copying to clipboard:", err);
      });
  };

  // Si estamos en modo de depuración y queremos mostrar los tokens en UI
  if (tokens.accessToken && process.env.NODE_ENV === "development") {
    return (
      <div style={styles.container}>
        <div style={styles.debugPanel}>
          <h2>🔑 Debug - Tokens Information</h2>

          <div style={styles.tokenSection}>
            <h3>📄 Access Token</h3>
            <div style={styles.tokenBox}>
              <code style={styles.tokenText}>
                {tokens.accessToken.substring(0, 100)}...
              </code>
              <button
                onClick={() =>
                  copyToClipboard(tokens.accessToken, "Access Token")
                }
                style={styles.copyButton}
              >
                📋 Copiar
              </button>
            </div>
            <p>
              <strong>Length:</strong> {tokens.accessToken.length} characters
            </p>
          </div>

          <div style={styles.tokenSection}>
            <h3>🔄 Refresh Token</h3>
            <div style={styles.tokenBox}>
              <code style={styles.tokenText}>
                {tokens.refreshToken.substring(0, 50)}...
              </code>
              <button
                onClick={() =>
                  copyToClipboard(tokens.refreshToken, "Refresh Token")
                }
                style={styles.copyButton}
              >
                📋 Copiar
              </button>
            </div>
            <p>
              <strong>Length:</strong> {tokens.refreshToken.length} characters
            </p>
          </div>

          <div style={styles.userInfo}>
            <h3>👤 User Information</h3>
            <p>
              <strong>Username:</strong>{" "}
              {tokens.tokenParsed?.preferred_username}
            </p>
            <p>
              <strong>Roles:</strong>{" "}
              {tokens.tokenParsed?.realm_access?.roles?.join(", ")}
            </p>
            <p>
              <strong>User ID:</strong> {tokens.tokenParsed?.sub}
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={styles.continueButton}
          >
            ➡️ Continuar al Dashboard
          </button>

          <button
            onClick={() => {
              printTokens(keycloak);
              setTokens({
                accessToken: keycloak.token,
                refreshToken: keycloak.refreshToken,
                tokenParsed: keycloak.tokenParsed,
              });
            }}
            style={styles.refreshButton}
          >
            🔄 Actualizar Tokens Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <h2>🔐 Redirecting to Keycloak...</h2>
        <p>
          Por favor espera mientras te redirigimos al servicio de autenticación.
        </p>
        <div style={styles.spinner}></div>

        {/* Solo mostrar en desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => printTokens(keycloak)}
            style={styles.debugButton}
          >
            🐛 Debug Tokens
          </button>
        )}
      </div>
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
    padding: "20px",
  },
  loading: {
    textAlign: "center",
    maxWidth: "400px",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #d16720ff",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 2s linear infinite",
    margin: "20px auto",
  },
  debugPanel: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
  },
  tokenSection: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
    border: "1px solid #e9ecef",
  },
  tokenBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  tokenText: {
    flex: 1,
    backgroundColor: "#e9ecef",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "12px",
    wordBreak: "break-all",
    fontFamily: "monospace",
  },
  copyButton: {
    backgroundColor: "#ff4800ff",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  userInfo: {
    backgroundColor: "#d1ecf1",
    padding: "15px",
    borderRadius: "5px",
    border: "1px solid #bee5eb",
    marginBottom: "20px",
  },
  continueButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginRight: "10px",
  },
  refreshButton: {
    backgroundColor: "#ffc107",
    color: "black",
    border: "none",
    padding: "12px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  debugButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "10px",
  },
};
