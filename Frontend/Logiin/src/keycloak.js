// keycloak.js
import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: "parcial-realm",
  clientId: "web-client",
});

let initialized = false;

export function initKeycloak() {
  if (initialized) return Promise.resolve();
  initialized = true;
  return keycloak.init({ onLoad: "check-sso", checkLoginIframe: false });
}
