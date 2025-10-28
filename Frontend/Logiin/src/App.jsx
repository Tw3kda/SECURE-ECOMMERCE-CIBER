import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router.jsx";
import { initKeycloak } from "./keycloak";

export default function App() {
  const [keycloakReady, setKeycloakReady] = useState(false);

  useEffect(() => {
    initKeycloak().then(() => setKeycloakReady(true));
  }, []);

  if (!keycloakReady) return <div>Loading...</div>;

  return <RouterProvider router={router} />;
}
