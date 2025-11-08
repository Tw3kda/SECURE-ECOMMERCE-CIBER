import React, { useEffect, useState } from "react";
import { getKeycloak } from "../../keycloak";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import ProductModal from "../../components/ProductModal";

export default function DashboardAdmin() {
  const [userData, setUserData] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const keycloak = getKeycloak();
    if (keycloak.authenticated && keycloak.token) {
      const tokenDecoded = parseJwt(keycloak.token);

      const user = {
        uid: tokenDecoded.sub,
        name: tokenDecoded.preferred_username || "",
        roles: tokenDecoded.realm_access?.roles || [],
        token: keycloak.token,
        isAdmin: true,
      };

      setUserData(user);

      const email = tokenDecoded.email || "";
      setUserEmail(email);

      fetchProductsWithImages(keycloak.token);
    } else {
      console.warn("⚠️ User not authenticated in Keycloak.");
    }
  }, []);

  const fetchProductsWithImages = async (tokenParam = null) => {
    setLoading(true);
    try {
      const token = tokenParam || userData?.token;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const processedProducts = await Promise.all(
          data.map(async (product) => {
            const hasImageData = product.hasImage && product.imageType;
            if (!hasImageData)
              return {
                ...product,
                imageUrl: "/placeholder-image.jpg",
                hasImage: false,
              };

            try {
              const imageResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/products/${
                  product.id
                }/image`,
                {
                  headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
                  mode: "cors",
                }
              );
              if (imageResponse.ok) {
                const imageBlob = await imageResponse.blob();
                if (imageBlob.size > 0) {
                  const imageUrl = URL.createObjectURL(imageBlob);
                  return { ...product, imageUrl, hasImage: true };
                }
              }
            } catch (error) {
              console.error(
                `🚨 Error fetching image for product ${product.id}:`,
                error
              );
            }
            return {
              ...product,
              imageUrl: "/placeholder-image.jpg",
              hasImage: false,
            };
          })
        );
        setProducts(processedProducts);
      } else setProducts([]);
    } catch (error) {
      console.error("🚨 Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      products.forEach((product) => {
        if (product.hasImage && product.imageUrl)
          URL.revokeObjectURL(product.imageUrl);
      });
    };
  }, [products]);

  const handleLogout = () => {
    const keycloak = getKeycloak();
    if (keycloak) keycloak.logout({ redirectUri: window.location.origin });
  };

  const handleRefreshProducts = () => fetchProductsWithImages();

  const handleCommentAdded = (productId, newComment) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      )
    );
  };

  const handleCommentRemoved = (productId, commentId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            }
          : p
      )
    );
  };

  const handleCreateProduct = () => {
    navigate("/CreateProduct");
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${userData?.token}`,
            },
          }
        );

        if (response.ok) {
          // Eliminar producto del estado local
          setProducts((prev) => prev.filter((p) => p.id !== productId));
          console.log("✅ Producto eliminado correctamente");
        } else {
          console.error("❌ Error al eliminar producto");
        }
      } catch (error) {
        console.error("❌ Error al eliminar producto:", error);
      }
    }
  };

  const handleImageUpdated = (updatedData) => {
    setUserData((prev) => ({ ...prev, imagen: updatedData.imagen }));
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (!userData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-gray-600"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,224,0.8) 0%, rgba(255,255,200,0.6) 50%, rgba(255,255,180,0.4) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2>Cargando información del administrador...</h2>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,224,0.8) 0%, rgba(255,255,200,0.6) 50%, rgba(255,255,180,0.4) 100%)",
        backdropFilter: "blur(15px)",
      }}
    >
      <Header
        userData={{ ...userData, email: userEmail }}
        isUserAdmin={true}
        loading={loading}
        onRefresh={handleRefreshProducts}
        onLogout={handleLogout}
        onImageUpdated={handleImageUpdated}
        showCart={false}
      />

      <main className="w-full py-16 px-4 relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>⚙️</span>
            <span>Panel de Administración</span>
          </div>

          <div className="flex flex-col items-center mb-4">
            <img
              src={
                userData?.imagen
                  ? `${import.meta.env.VITE_API_URL}/api/client-data/${
                      userData.uid
                    }/image`
                  : "/placeholder-image.jpg"
              }
              alt="Avatar administrador"
              className="w-20 h-20 rounded-full border-2 border-gray-200 mb-2"
            />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
              Gestión de Productos
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Administra el catálogo de arepas artesanales. Crea y elimina
              productos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleCreateProduct}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:shadow-lg hover:scale-105"
            >
              ➕ Crear Nuevo Producto
            </button>

            <button
              onClick={handleRefreshProducts}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-800 border-2 border-gray-300 hover:border-yellow-400 hover:shadow-lg"
              }`}
            >
              {loading ? "🔄 Cargando..." : "🔄 Actualizar"}
            </button>

            <div className="w-full mt-4">
              <p className="text-sm text-gray-600">
                ⚙️ Modo Administrador: Haz clic en cualquier producto para
                gestionarlo
              </p>
            </div>
          </div>
        </div>

        {/* Sección de productos */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">
            Catálogo de Productos
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-12"></div>

          {loading ? (
            <p className="text-center text-gray-500 text-lg py-12">
              Cargando productos...
            </p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                  onClick={() => handleProductClick(product)}
                >
                  <ProductCard
                    productId={product.id}
                    image={product.imageUrl}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    rating={product.rating || 4.5}
                    reviewCount={product.reviewCount || 0}
                    commentCount={product.comments?.length || 0}
                    initialComments={product.comments || []}
                    onCommentAdded={handleCommentAdded}
                    onCommentRemoved={handleCommentRemoved}
                    onViewReviews={() => {}}
                    isAdmin={true}
                    hideDescriptionButton={true}
                    showCartActions={false}
                    onDeleteProduct={handleDeleteProduct}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6 text-6xl">🍽️</div>
              <p className="text-xl text-gray-600 mb-2">
                No hay productos disponibles
              </p>
              <p className="text-sm text-gray-500">
                Crea tu primer producto usando el botón de arriba
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal para administrador */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isAdmin={true}
          onClose={handleCloseModal}
          onCommentAdded={handleCommentAdded}
          onCommentRemoved={handleCommentRemoved}
          showCartActions={false}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </div>
  );
}
