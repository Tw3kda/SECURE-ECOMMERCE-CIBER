// src/pages/private/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getKeycloak } from "../../keycloak";
import { useNavigate } from "react-router-dom";

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
      const userRole = tokenDecoded.realm_access?.roles || [];
      const userId = tokenDecoded.sub;
      const userName = tokenDecoded.preferred_username || "";

      const userIsAdmin = userRole.includes("admin");
      setIsUserAdmin(userIsAdmin);

      sessionStorage.setItem("userUID", userId);
      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("userRoles", JSON.stringify(userRole));
      sessionStorage.setItem("isAdmin", userIsAdmin.toString());

      const userDataObj = {
        uid: userId,
        name: userName,
        roles: userRole,
        token: keycloak.token,
        isAdmin: userIsAdmin,
      };

      setUserData(userDataObj);

      console.log("✅ Dashboard - Usuario autenticado");
      console.log("🆔 User ID:", userId);
      console.log("👤 Username:", userName);
      console.log("🎯 Roles:", userRole);
      console.log("👑 Es Admin:", userIsAdmin);

      // 🔥 CORRECCIÓN: Llamar fetchProducts después de setUserData
      fetchProducts(userDataObj.token);
    }
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return {};
    }
  };

  const fetchProducts = async (tokenParam = null) => {
    setLoading(true);
    try {
      // 🔥 CORRECCIÓN: Usar el token del parámetro o de userData
      const token =
        tokenParam || userData?.token || sessionStorage.getItem("token");

      console.log("🔐 Token usado para fetch:", token ? "PRESENTE" : "AUSENTE");

      const response = await fetch("https://localhost:9444/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
        console.log("📦 Productos cargados:", productsData.length, "productos");
      } else {
        console.error(
          "❌ Error al obtener productos. Status:",
          response.status
        );
        if (response.status === 403) {
          console.error("🔐 Acceso denegado - verificar roles del usuario");
        }
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userUID");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRoles");
    sessionStorage.removeItem("isAdmin");

    const keycloak = getKeycloak();
    keycloak.logout();
  };

  const testCreateProduct = () => {
    if (!isUserAdmin) {
      alert("❌ Solo los administradores pueden crear productos");
      return;
    }
    navigate("/CreateProduct");
  };

  const addToCart = (product) => {
    alert(`🛒 ${product.name} agregado al carrito!`);
    console.log("Producto agregado:", product);
  };

  // 🔥 CORRECCIÓN: Botón para forzar recarga de productos
  const handleRefreshProducts = () => {
    fetchProducts();
  };

  if (!userData) {
    return (
      <div style={styles.container}>
        <h2>Cargando información del usuario...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER CON INFORMACIÓN DEL USUARIO */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            {isUserAdmin ? "🛠️ Panel de Administración" : "🛍️ Tienda Virtual"}
          </h1>
          <div style={styles.userInfo}>
            <span style={styles.welcomeText}>Hola, {userData.name}</span>
            <div style={styles.userBadges}>
              {userData.roles.map((role, index) => (
                <span
                  key={index}
                  style={{
                    ...styles.roleBadge,
                    ...(role === "admin"
                      ? styles.adminBadge
                      : styles.userBadge),
                  }}
                >
                  {role}
                  {role === "admin" && " 👑"}
                </span>
              ))}
            </div>

            {/* 🔥 BOTÓN DE DEBUG PARA RECARGAR PRODUCTOS */}
            <button
              style={styles.refreshBtn}
              onClick={handleRefreshProducts}
              disabled={loading}
            >
              {loading ? "🔄 Cargando..." : "🔄 Recargar Productos"}
            </button>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={styles.mainContent}>
        {isUserAdmin ? (
          // 🛠️ VISTA PARA ADMINISTRADORES
          <div style={styles.adminView}>
            <div style={styles.adminPanel}>
              <h2>Panel de Control</h2>
              <p>Gestiona todos los aspectos de la tienda</p>

              <div style={styles.adminActions}>
                <button style={styles.primaryBtn} onClick={testCreateProduct}>
                  ➕ Crear Nuevo Producto
                </button>
                <button
                  style={styles.secondaryBtn}
                  onClick={handleRefreshProducts}
                  disabled={loading}
                >
                  {loading ? "🔄 Cargando..." : "🔄 Actualizar Productos"}
                </button>
              </div>

              {/* LISTA DE PRODUCTOS PARA ADMIN */}
              <div style={styles.productsSection}>
                <h3>Productos Existentes ({products.length})</h3>
                {loading ? (
                  <p>🔄 Cargando productos...</p>
                ) : (
                  <div style={styles.adminProductsGrid}>
                    {products.map((product) => (
                      <div key={product.id} style={styles.adminProductCard}>
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <p style={styles.price}>${product.price}</p>
                        <p style={styles.commentCount}>
                          💬 {product.comments?.length || 0} comentarios
                        </p>
                        <div style={styles.adminActions}>
                          <button style={styles.editBtn}>✏️ Editar</button>
                          <button style={styles.deleteBtn}>🗑️ Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // 🛍️ VISTA PARA USUARIOS NORMALES (TIENDA VIRTUAL)
          <div style={styles.storeView}>
            <div style={styles.storeHeader}>
              <h2>Nuestros Productos</h2>
              <p>Descubre nuestra increíble selección de productos</p>
              <button
                style={styles.refreshBtn}
                onClick={handleRefreshProducts}
                disabled={loading}
              >
                {loading ? "🔄 Cargando..." : "🔄 Actualizar Productos"}
              </button>
            </div>

            {loading ? (
              <div style={styles.loading}>
                <p>🔄 Cargando productos...</p>
              </div>
            ) : (
              <div style={styles.productsGrid}>
                {products.map((product) => (
                  <div key={product.id} style={styles.productCard}>
                    <div style={styles.productImage}>
                      <div style={styles.imagePlaceholder}>
                        🖼️ {product.name}
                      </div>
                    </div>
                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{product.name}</h3>
                      <p style={styles.productDescription}>
                        {product.description}
                      </p>
                      <div style={styles.productFooter}>
                        <span style={styles.productPrice}>
                          ${product.price}
                        </span>
                        <button
                          style={styles.addToCartBtn}
                          onClick={() => addToCart(product)}
                        >
                          🛒 Agregar
                        </button>
                      </div>
                    </div>

                    {/* SECCIÓN DE COMENTARIOS */}
                    {product.comments && product.comments.length > 0 && (
                      <div style={styles.commentsSection}>
                        <h4>💬 Opiniones ({product.comments.length})</h4>
                        {product.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} style={styles.comment}>
                            <strong>{comment.author}:</strong> {comment.content}
                          </div>
                        ))}
                        {product.comments.length > 2 && (
                          <p style={styles.moreComments}>
                            +{product.comments.length - 2} más comentarios
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {products.length === 0 && !loading && (
              <div style={styles.emptyState}>
                <h3>📦 No hay productos disponibles</h3>
                <p>Vuelve más tarde para ver nuestra selección</p>
                <button
                  style={styles.refreshBtn}
                  onClick={handleRefreshProducts}
                >
                  🔄 Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: "1rem 0",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    color: "#2c3e50",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  welcomeText: {
    fontWeight: "bold",
    color: "#2c3e50",
  },
  userBadges: {
    display: "flex",
    gap: "0.5rem",
  },
  roleBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "1rem",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  adminBadge: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  userBadge: {
    backgroundColor: "#28a745",
    color: "white",
  },
  logoutBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },

  // 🛠️ ESTILOS PARA ADMINISTRADORES
  adminView: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  adminActions: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  primaryBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
  secondaryBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
  adminProductsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginTop: "1rem",
  },
  adminProductCard: {
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #dee2e6",
  },
  price: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#28a745",
  },
  commentCount: {
    fontSize: "0.875rem",
    color: "#6c757d",
  },
  editBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#ffc107",
    color: "black",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    marginRight: "0.5rem",
  },
  deleteBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
  },

  // 🛍️ ESTILOS PARA TIENDA VIRTUAL (USUARIOS NORMALES)
  storeView: {
    padding: "0 1rem",
  },
  storeHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "2rem",
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  productCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 15px rgba(0,0,0,0.15)",
  },
  productImage: {
    height: "200px",
    backgroundColor: "#e9ecef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    color: "#6c757d",
    fontSize: "1.5rem",
  },
  productInfo: {
    padding: "1.5rem",
  },
  productName: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
    color: "#2c3e50",
  },
  productDescription: {
    color: "#6c757d",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  productFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#28a745",
  },
  addToCartBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "0.25rem",
    cursor: "pointer",
    fontWeight: "bold",
  },
  commentsSection: {
    padding: "1rem 1.5rem",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #dee2e6",
  },
  comment: {
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
    color: "#495057",
  },
  moreComments: {
    fontSize: "0.75rem",
    color: "#6c757d",
    textAlign: "center",
    margin: 0,
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#6c757d",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#6c757d",
  },
};
