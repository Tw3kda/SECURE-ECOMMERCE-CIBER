// keycloak.js
import Keycloak from "keycloak-js";

let keycloak;

export const initKeycloak = async () => {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: "Ecommerce",
      clientId: "web-client",
    });

    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod: "S256",
      });

      console.log("🔑 Keycloak initialized, authenticated:", authenticated);

      if (keycloak.authenticated) {
        localStorage.setItem("token", keycloak.token);
        localStorage.setItem("refreshToken", keycloak.refreshToken);

        console.log(
          "✅ Token stored, roles:",
          keycloak.tokenParsed?.realm_access?.roles
        );
        console.log("🧑‍💻 Username:", keycloak.tokenParsed?.preferred_username);
        console.log("🆔 User ID:", keycloak.subject);
        console.log("📄 Access Token:", keycloak.token);
        console.log("♻️ Refresh Token:", keycloak.refreshToken);
        console.log(
          "⏰ Expira en:",
          new Date(keycloak.tokenParsed?.exp * 1000).toLocaleString()
        );
      }

      // Configurar auto-refresh más agresivo
      setInterval(() => {
        if (keycloak.authenticated) {
          keycloak
            .updateToken(30) // Refresh si expira en menos de 30 segundos
            .then((refreshed) => {
              if (refreshed) {
                console.log("🔄 Token auto-refreshed");
                localStorage.setItem("token", keycloak.token);
                console.log("📄 Nuevo Access Token:", keycloak.token);
              }
            })
            .catch((error) => {
              console.error("❌ Auto-refresh failed:", error);
            });
        }
      }, 30000); // Chequear cada 30 segundos
    } catch (error) {
      console.error("❌ Keycloak init failed:", error);
    }
  }

  return keycloak;
};

export const getKeycloak = () => keycloak;

export const isAdmin = () => {
  return keycloak?.tokenParsed?.realm_access?.roles?.includes("admin") || false;
};

// Función para obtener token fresco
export const getFreshToken = async () => {
  if (!keycloak) return null;

  try {
    const refreshed = await keycloak.updateToken(30);
    if (refreshed) {
      console.log("🔄 Token refreshed in getFreshToken");
      console.log("📄 Nuevo Access Token:", keycloak.token);
    }
    return keycloak.token;
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    return null;
  }
};
