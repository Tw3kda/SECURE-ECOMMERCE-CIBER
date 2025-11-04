import { useEffect, useState } from "react";
import { initKeycloak } from "./keycloak";

export default function KeycloakProvider({ children }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initKeycloak();
      setInitialized(true);
    };
    init();
  }, []);

  if (!initialized)
    return <div className="p-4">🔐 Cargando autenticación...</div>;

  return children;
}
