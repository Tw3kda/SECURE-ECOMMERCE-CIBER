import { useState } from "react";
import { getKeycloak, isAdmin } from "../../keycloak";

export default function CreateProduct() {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si el usuario es admin
    if (!isAdmin()) {
      setError("❌ Solo los administradores pueden crear productos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const keycloak = getKeycloak();

      // 🔥 Asegurar que el token esté actualizado
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        console.log("Token refrescado automáticamente");
      }

      const token = keycloak.token;

      console.log("🔐 Token being sent:", token ? "Present" : "Missing");
      console.log("👤 User authenticated:", keycloak.authenticated);

      // Validar campos
      if (
        !product.name.trim() ||
        !product.description.trim() ||
        !product.price
      ) {
        setError("❌ Todos los campos son obligatorios");
        setLoading(false);
        return;
      }

      console.log("📤 Sending request to backend...");
      console.log("🧠 Endpoint:", "https://localhost:9444/api/products");
      console.log(
        "🔐 Authorization Header:",
        `Bearer ${token.substring(0, 50)}...`
      );
      console.log("📦 Request Body:", product);

      const response = await fetch("https://localhost:9444/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 Asegurar que Bearer esté en mayúscula
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
        }),
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const createdProduct = await response.json();
        alert("✅ Producto creado exitosamente!");
        console.log("Producto creado:", createdProduct);
        setProduct({ name: "", description: "", price: "" });
      } else if (response.status === 403) {
        setError("❌ Acceso denegado: No tienes permisos de administrador");
      } else if (response.status === 401) {
        setError(
          "❌ Error 401: Token inválido o expirado. Intentando renovar..."
        );

        // Forzar renovación del token
        try {
          await keycloak.updateToken(-1); // Forzar renovación
          const newToken = keycloak.token;
          console.log("🔄 Token renovado:", newToken ? "Success" : "Failed");

          if (newToken) {
            // Reintentar la petición con nuevo token
            setError(
              "🔄 Token renovado. Intenta crear el producto nuevamente."
            );
          } else {
            setError(
              "❌ No se pudo renovar el token. Por favor, vuelve a iniciar sesión."
            );
            setTimeout(() => keycloak.login(), 2000);
          }
        } catch (refreshError) {
          setError(
            "❌ Error renovando token. Por favor, vuelve a iniciar sesión."
          );
          setTimeout(() => keycloak.login(), 2000);
        }
      } else {
        const errorText = await response.text();
        setError(`❌ Error del servidor (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("❌ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario no es admin, mostrar mensaje
  if (!isAdmin()) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Acceso Restringido
        </h2>
        <p className="text-gray-700">
          Solo los administradores pueden crear productos.
        </p>
        <button
          onClick={() => getKeycloak().login()}
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Iniciar Sesión como Admin
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Crear Producto (Admin)</h2>

      {/* Debug info */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-sm">
        <strong>Debug Info:</strong>
        <div>
          Autenticado: {getKeycloak()?.authenticated ? "✅ Sí" : "❌ No"}
        </div>
        <div>Token: {getKeycloak()?.token ? "✅ Presente" : "❌ Ausente"}</div>
        <div>
          Roles:{" "}
          {getKeycloak()?.tokenParsed?.realm_access?.roles?.join(", ") ||
            "Ninguno"}
        </div>
      </div>

      {error && (
        <div
          className={`p-4 rounded mb-4 ${
            error.includes("✅")
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Laptop Gaming"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción detallada del producto..."
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 p-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Creando..." : "Crear Producto"}
          </button>

          <button
            type="button"
            onClick={() => {
              // Forzar refresh del token
              getKeycloak()
                ?.updateToken(-1)
                .then((refreshed) => {
                  if (refreshed) {
                    alert("✅ Token refrescado manualmente");
                  } else {
                    alert("ℹ️ Token aún válido");
                  }
                });
            }}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            🔄 Refresh Token
          </button>
        </div>
      </form>
    </div>
  );
}
