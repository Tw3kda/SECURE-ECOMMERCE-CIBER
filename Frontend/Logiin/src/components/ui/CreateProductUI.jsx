import React from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProductUI({
  product,
  onChange,
  onSubmit,
  onImageChange,
  imagePreview,
  loading,
  error,
  onForceRefreshToken,
  isAdmin,
  getKeycloak,
}) {
  const navigate = useNavigate();

  // Si no es admin mostramos el card de acceso restringido
  if (!isAdmin) {
    return (
      <div className="bg-gradient-to-r from-blue-300 to-purple-500 min-h-screen flex justify-center items-center p-4">
        <div className="py-8 px-6 max-w-md bg-white bg-opacity-30 rounded-lg shadow-lg backdrop-blur-xl backdrop-filter">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-5">
            Acceso Restringido
          </h1>
          <p className="text-lg text-center text-gray-700 mb-8">
            Solo los administradores pueden crear productos.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => getKeycloak().login()}
              className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
            >
              Iniciar Sesión como Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-300 to-purple-500 min-h-screen flex justify-center items-center p-4">
      <div className="py-8 px-6 max-w-md bg-white bg-opacity-30 rounded-lg shadow-lg backdrop-blur-xl backdrop-filter w-full">
        {/* Botón Volver al Inicio */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-gray-800 hover:text-gray-600 font-semibold transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Volver al Inicio
        </button>

        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Crear Producto
        </h1>
        <p className="text-lg text-center text-gray-700 mb-8">
          Panel exclusivo para administradores
        </p>

        {/* Error box */}
        {error && (
          <div
            className={`p-3 rounded text-sm mb-6 backdrop-blur-sm ${
              error.includes("✅")
                ? "bg-green-50 bg-opacity-50 border border-green-200 text-green-700"
                : "bg-red-50 bg-opacity-50 border border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={onSubmit} className="flex flex-col">
          {/* Campo Nombre */}
          <div className="mb-5">
            <label
              className="text-gray-700 font-semibold mb-2 block"
              htmlFor="name"
            >
              Nombre del Producto
            </label>
            <input
              name="name"
              value={product.name}
              onChange={onChange}
              className="bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal"
              type="text"
              id="name"
              placeholder="Ej: Laptop Gaming"
              required
            />
          </div>

          {/* Campo Descripción */}
          <div className="mb-5">
            <label
              className="text-gray-700 font-semibold mb-2 block"
              htmlFor="description"
            >
              Descripción
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={onChange}
              className="bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal"
              id="description"
              placeholder="Descripción detallada del producto..."
              rows="4"
              required
            />
          </div>

          {/* Campo Precio */}
          <div className="mb-5">
            <label
              className="text-gray-700 font-semibold mb-2 block"
              htmlFor="price"
            >
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={product.price}
              onChange={onChange}
              className="bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal"
              id="price"
              placeholder="0.00"
              required
            />
          </div>

          {/* Campo Imagen */}
          <div className="mb-5">
            <label
              className="text-gray-700 font-semibold mb-2 block"
              htmlFor="image"
            >
              Imagen del Producto
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={onImageChange}
              className="bg-transparent border rounded-lg shadow border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 py-2 px-4 block w-full appearance-none leading-normal file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            
            {/* Vista previa de la imagen */}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 mb-2">Vista previa:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creando Producto..." : "Crear Producto"}
            </button>

            <button
              type="button"
              onClick={onForceRefreshToken}
              className="bg-gradient-to-r from-blue-400 to-green-500 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
            >
              🔄 Refrescar Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}