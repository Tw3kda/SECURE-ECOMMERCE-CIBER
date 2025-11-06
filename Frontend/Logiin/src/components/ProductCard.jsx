import React from "react";

const ProductCard = ({
  image,
  name,
  description,
  price = 0,
  rating = 0,
  reviewCount = 0,
  commentCount = 0,
  onViewReviews,
  isAdmin = false,
  onDeleteProduct,
}) => {
  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      onDeleteProduct?.();
    }
  };

  const hasReviews = reviewCount > 0;
  const hasComments = commentCount > 0;

  return (
    <div className="group bg-white bg-opacity-20 backdrop-blur-xl backdrop-filter rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-white border-opacity-30">
      {/* Imagen del producto */}
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título y Precio */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1 flex-1 mr-2">
            {name}
          </h3>
          <span className="text-2xl font-bold text-green-600 whitespace-nowrap">
            ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        {/* Estadísticas: Rating y Comentarios */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Rating */}
          {hasReviews && (
            <div className="flex items-center gap-2 bg-yellow-50 bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-200">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-4 h-4 ${
                      index < Math.floor(rating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-600">({reviewCount})</span>
            </div>
          )}

          {/* Comentarios */}
          <div className="flex items-center gap-2 bg-blue-50 bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-200">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800">{commentCount}</span>
            <span className="text-xs text-gray-600">comentarios</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2">
          {/* Botón Ver Reseñas */}
          <button
            onClick={onViewReviews}
            disabled={!hasReviews && !hasComments}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-300 ease-in-out shadow-md ${
              hasReviews || hasComments
                ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
          >
            {hasReviews || hasComments ? "💬 Ver Comentarios" : "Sin Comentarios"}
          </button>

          {/* Botón Eliminar - Solo para Admin */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="w-full py-2 px-4 rounded-lg font-semibold bg-gradient-to-r from-red-400 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition duration-300 ease-in-out shadow-md"
            >
              🗑️ Eliminar Producto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;