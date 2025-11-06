import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKeycloak, isAdmin } from "../../keycloak";
import CreateProductUI from "../../components/ui/CreateProductUI";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", parseFloat(product.price));
      
      if (imageFile) {
        formData.append("image", imageFile);
        console.log("🖼️ Image file attached:", imageFile.name);
      }

      console.log("📦 Request Body (FormData):", {
        name: product.name,
        description: product.description,
        price: product.price,
        image: imageFile ? imageFile.name : "No image"
      });

      const response = await fetch("https://localhost:9444/api/products", {
        method: "POST",
        headers: {
          // NO incluir Content-Type cuando usas FormData, el navegador lo setea automáticamente
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const createdProduct = await response.json();
        console.log("✅ Producto creado:", createdProduct);
        
        // Mostrar mensaje de éxito
        alert("✅ Producto creado exitosamente!");
        
        // Limpiar formulario
        setProduct({ name: "", description: "", price: "" });
        setImageFile(null);
        setImagePreview(null);
        
        // Redirigir al inicio después de 1 segundo
        setTimeout(() => {
          navigate("/");
        }, 1000);
        
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

  const handleForceRefreshToken = () => {
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
  };

  return (
    <CreateProductUI
      product={product}
      onChange={handleChange}
      onImageChange={handleImageChange}
      imagePreview={imagePreview}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onForceRefreshToken={handleForceRefreshToken}
      isAdmin={isAdmin()}
      getKeycloak={getKeycloak}
    />
  );
}