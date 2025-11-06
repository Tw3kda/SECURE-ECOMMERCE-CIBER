import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { initKeycloak } from "./keycloak.js";
import './index.css' 

initKeycloak()
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("❌ Keycloak initialization failed:", error);
  });
