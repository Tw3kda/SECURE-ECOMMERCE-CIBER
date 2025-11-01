import Keycloak from "keycloak-js";

let keycloak;

export const initKeycloak = async () => {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: "Ecommerce",
      clientId: "web-client",
    });

    await keycloak.init({
      onLoad: "check-sso",
      checkLoginIframe: false,
      pkceMethod: "S256",
    });
  }

  return keycloak;
};

export const getKeycloak = () => keycloak;
