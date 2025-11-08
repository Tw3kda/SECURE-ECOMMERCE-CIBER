// components/ProductModal.jsx
import React, { useState, useEffect } from "react";
import { getKeycloak } from "../keycloak";

const ProductModal = ({
  product,
  isAdmin,
  onClose,
  onCommentAdded,
  onCommentRemoved,
}) => {
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const keycloak = getKeycloak();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    // Guardar el estado original del body
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Bloquear el scroll
    document.body.style.overflow = "hidden";

    // Cerrar modal con Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Cleanup: restaurar el scroll cuando el modal se cierre
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!keycloak.authenticated) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    // LOS ADMINS NO PUEDEN COMENTAR
    if (isAdmin) {
      alert("Los administradores no pueden agregar comentarios");
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${product.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify({
            content: newComment,
            userId: keycloak.tokenParsed?.sub,
            userName: keycloak.tokenParsed?.preferred_username || "Usuario",
          }),
        }
      );

      if (response.ok) {
        const createdComment = await response.json();
        onCommentAdded(product.id, createdComment);
        setNewComment("");
      } else {
        console.error("Error al agregar comentario");
        alert("Error al agregar comentario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al agregar comentario");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!keycloak.authenticated) {
      alert("Debes iniciar sesión para eliminar comentarios");
      return;
    }

    if (!isAdmin) {
      alert("Solo los administradores pueden eliminar comentarios");
      return;
    }

    // Confirmación antes de eliminar
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar este comentario?")
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );

      if (response.ok) {
        onCommentRemoved(product.id, commentId);
        console.log("Comentario eliminado exitosamente");
      } else if (response.status === 404) {
        alert("Comentario no encontrado");
      } else {
        console.error("Error al eliminar comentario");
        alert("Error al eliminar comentario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión al eliminar comentario");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      {/* Fondo con efecto glassmorphism OSCURECIDO */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-black bg-opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Contenido del modal */}
      <div
        className="bg-white bg-opacity-95 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200 shadow-2xl mt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal con botón X */}
        <div className="sticky top-0 bg-white rounded-t-2xl flex justify-between items-center p-6 border-b border-gray-200 z-10">
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Imagen del producto */}
            <div>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-80 object-cover rounded-2xl shadow-lg border border-gray-200"
              />
            </div>

            {/* Información del producto */}
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h3>
              <p className="text-4xl font-bold text-yellow-600 mb-6">
                ${product.price}
              </p>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Descripción
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 text-xl">
                  {"★".repeat(Math.floor(product.rating || 4.5))}
                  {"☆".repeat(5 - Math.floor(product.rating || 4.5))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({product.reviewCount || 0} reseñas)
                </span>
              </div>
            </div>
          </div>

          {/* Sección de comentarios */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Comentarios ({product.comments?.length || 0})
            </h4>

            {/* Formulario para nuevo comentario - SOLO PARA CLIENTES */}
            {!isAdmin && keycloak.authenticated && (
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-800 placeholder-gray-500"
                  rows="3"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="mt-2 bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {submittingComment ? "Enviando..." : "Agregar Comentario"}
                </button>
              </div>
            )}

            {/* Mensaje para admins */}
            {isAdmin && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Modo Administrador:</strong> Puedes eliminar
                  comentarios inapropiados usando el botón "Eliminar".
                </p>
              </div>
            )}

            {/* Mensaje para usuarios no autenticados */}
            {!keycloak.authenticated && (
              <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">
                  <strong>Inicia sesión</strong> para agregar comentarios.
                </p>
              </div>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
              {product.comments?.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {comment.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* SOLO LOS ADMINS PUEDEN ELIMINAR COMENTARIOS */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {(!product.comments || product.comments.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No hay comentarios aún.{" "}
                  {!isAdmin && "¡Sé el primero en comentar!"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
