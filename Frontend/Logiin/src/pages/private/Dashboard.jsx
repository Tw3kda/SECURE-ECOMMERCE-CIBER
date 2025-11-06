import React, { useEffect, useState } from "react";
import { getKeycloak } from "../../keycloak";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import Container from "../../components/container.jsx";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const keycloak = getKeycloak();
    if (keycloak.authenticated && keycloak.token) {
      const tokenDecoded = parseJwt(keycloak.token);
      const roles = tokenDecoded.realm_access?.roles || [];
      const userIsAdmin = roles.includes("admin");

      const user = {
        uid: tokenDecoded.sub,
        name: tokenDecoded.preferred_username || "",
        roles,
        token: keycloak.token,
        isAdmin: userIsAdmin,
      };

      setUserData(user);
      setIsUserAdmin(userIsAdmin);
      fetchProducts(keycloak.token); // ✅ Pasar el token aquí
    }
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  };

  const fetchProducts = async (tokenParam = null) => {
    setLoading(true);
    try {
      const token = tokenParam || userData?.token;
      const response = await fetch("https://localhost:9444/api/products", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Error fetching products:", response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => getKeycloak().logout();
  const handleRefreshProducts = () => fetchProducts();
  const handleDeleteReview = (productId) => {
    if (!isUserAdmin) return;
    console.log("Eliminar reseña de producto:", productId);
  };

  const handleCreateProduct = () => {
    if (isUserAdmin) navigate("/CreateProduct");
  };
  //BACKGROUND GRADIENT
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <h2>Cargando información del usuario...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 to-purple-500 flex flex-col">
      {/* Barra superior */}
      <Header
        userData={userData}
        isUserAdmin={isUserAdmin}
        loading={loading}
        onRefresh={handleRefreshProducts}
        onLogout={handleLogout}
      />

      {/* Contenido principal */}
      <main className="flex-1 flex justify-center items-start py-10 px-4">
        <Container>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {isUserAdmin ? "Panel de Administración" : "Catálogo de Productos"}
          </h2>

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={handleCreateProduct}
              disabled={!isUserAdmin}
              className={`px-5 py-2 rounded-xl text-white text-sm font-medium transition ${
                isUserAdmin
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              ➕ Crear Nuevo Producto
            </button>

            <button
              onClick={handleRefreshProducts}
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-white text-sm font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "🔄 Cargando..." : "🔄 Actualizar"}
            </button>
          </div>

          {/* Lista de productos */}
          {loading ? (
            <p className="text-center text-gray-500">Cargando productos...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.imageUrl}
                  name={product.name}
                  description={product.description}
                  price={product.price} // ✅ Agregar precio
                  rating={product.rating || 4.5}
                  commentCount={product.comments?.length || 0} // ✅ Agregar contador de comentarios
                  onViewReviews={() => handleDeleteReview(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">No hay productos disponibles.</p>
              <p className="text-sm mt-1">
                Usa los botones de arriba para crear o recargar.
              </p>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}