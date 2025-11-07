import React, { useEffect, useState } from "react";
import { getKeycloak } from "../../keycloak";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";

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

      console.log("👤 User authenticated:", user);
      console.log(
        "🔑 Token (first 50 chars):",
        keycloak.token.substring(0, 50) + "..."
      );

      fetchProductsWithImages(keycloak.token);
    } else {
      console.warn("⚠️ User not authenticated in Keycloak.");
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

  const fetchProductsWithImages = async (tokenParam = null) => {
    setLoading(true);
    console.log("📡 Fetching products from API...");

    try {
      const token = tokenParam || userData?.token;
      const response = await fetch("https://localhost:9444/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📦 Products response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.length} products received from backend:`, data);

        const processedProducts = await Promise.all(
          data.map(async (product) => {
            console.log("🧩 Product details:", product);

            // el DTO expone `hasImage` e `imageType` (no siempre imageName)
            const hasImageData = product.hasImage && product.imageType;

            if (!hasImageData) {
              console.log(`⏭️ Product ${product.id} has no image data`);
              return {
                ...product,
                imageUrl: "/placeholder-image.jpg",
                hasImage: false,
              };
            }

            try {
              console.log(`🖼️ Fetching image for product ${product.id}`);

              const imageResponse = await fetch(`https://localhost:9444/api/products/${product.id}/image`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "*/*",
                },
                mode: "cors",
              });

              console.log(
                `📡 Image response for product ${product.id}: ${imageResponse.status} ${imageResponse.statusText}`
              );

              if (imageResponse.ok) {
                const imageBlob = await imageResponse.blob();
                console.log(`📸 Blob info for ${product.id}:`, {
                  size: imageBlob.size,
                  type: imageBlob.type,
                });

                if (imageBlob.size > 0) {
                  const imageUrl = URL.createObjectURL(imageBlob);
                  console.log(
                    `✅ Image URL generated for product ${product.id}`
                  );
                  return { ...product, imageUrl, hasImage: true };
                } else {
                  console.log(`❌ Empty blob for product ${product.id}`);
                }
              } else {
                const errorText = await imageResponse.text();
                console.log(
                  `❌ Image fetch failed (${product.id}):`,
                  errorText
                );
              }
            } catch (error) {
              console.error(
                `🚨 Network error fetching image for ${product.id}:`,
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

        console.log("🎉 Processed products (with images):", processedProducts);
        setProducts(processedProducts);
      } else {
        console.error(
          "❌ Error fetching products:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Response body:", errorText);
        setProducts([]);
      }
    } catch (error) {
      console.error("🚨 Connection or parsing error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      products.forEach((product) => {
        if (product.hasImage && product.imageUrl) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, [products]);

  const handleLogout = () => getKeycloak().logout();
  const handleRefreshProducts = () => {
    console.log("🔁 Manual refresh triggered...");
    fetchProductsWithImages();
  };
  const handleDeleteReview = (productId) => {
    if (!isUserAdmin) return;
    console.log("🗑️ Delete review for product:", productId);
  };
  
  // Actualizar estado de productos cuando se agrega o elimina un comentario
  const handleCommentAdded = (productId, newComment) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, comments: [ ...(p.comments || []), newComment ] } : p));
  };

  const handleCommentRemoved = (productId, commentId) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
  };
  const handleCreateProduct = () => {
    if (isUserAdmin) navigate("/CreateProduct");
  };

  if (!userData) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center text-gray-600"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,224,0.8) 0%, rgba(255,255,200,0.6) 50%, rgba(255,255,180,0.4) 100%)",
          backdropFilter: "blur(10px)"
        }}
      >
        <h2>Cargando información del usuario...</h2>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,224,0.8) 0%, rgba(255,255,200,0.6) 50%, rgba(255,255,180,0.4) 100%)",
        backdropFilter: "blur(15px)",
        position: "relative"
      }}
    >
      {/* Fondo adicional para mejorar el efecto difuminado */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 30% 70%, rgba(255,255,150,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,180,0.2) 0%, transparent 50%)",
          zIndex: -1
        }}
      />
      
      <Header
        userData={userData}
        isUserAdmin={isUserAdmin}
        loading={loading}
        onRefresh={handleRefreshProducts}
        onLogout={handleLogout}
      />

      <main className="w-full py-16 px-4 relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>☀️</span>
            <span>Auténtico Sabor Arepense</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Arepas Artesanales
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Deliciosas arepas hechas a mano con amor. Disfruta el auténtico sabor de Arepabuelas en cada bocado.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleCreateProduct}
              disabled={!isUserAdmin}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md ${
                isUserAdmin
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:shadow-lg hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
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
          </div>
        </div>

        {/* Sección de productos */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">
            Nuestros Productos
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mb-12"></div>

          {loading ? (
            <p className="text-center text-gray-500 text-lg py-12">
              Cargando productos...
            </p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
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
                  onViewReviews={() => handleDeleteReview(product.id)}
                  isAdmin={isUserAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6 text-6xl">🍽️</div>
              <p className="text-xl text-gray-600 mb-2">
                No hay productos disponibles
              </p>
              <p className="text-sm text-gray-500">
                {isUserAdmin
                  ? "Crea tu primer producto usando el botón de arriba"
                  : "Vuelve pronto para ver nuestras deliciosas arepas"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}