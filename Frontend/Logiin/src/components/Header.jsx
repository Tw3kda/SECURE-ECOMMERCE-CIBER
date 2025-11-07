import React, { useState, useRef, useEffect } from "react";
import { ShoppingBag, User, LogOut } from "lucide-react";
import CartDrawer from "./ui/cartDrawer";

export default function Header({ userData, onLogout, onImageUpdated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("correo", userData.email || "");
    formData.append("imagen", selectedFile);
    formData.append("usoCodigoDescuento", false);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/client-data`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userData.token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();
      if (onImageUpdated) onImageUpdated(data); // Actualiza avatar en Dashboard
      setShowModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleViewProfile = () => setShowModal(true);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/70 backdrop-bl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Arepa Sunshine</h1>
            <p className="text-xs text-yellow-600 font-medium">Corner Shop Delights</p>
          </div>
        </div>

        {/* Navegación + usuario */}
        <div className="flex items-center gap-6">
          <a href="#productos" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors">Productos</a>
          <a href="#nosotros" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors">Nosotros</a>
          <a href="#contacto" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors">Contacto</a>

          <CartDrawer />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-yellow-100 transition-colors duration-200 border-2 border-gray-200 hover:border-yellow-300"
            >
              <img
                src={userData?.imagen ? `${import.meta.env.VITE_API_URL}/api/client-data/${userData.uid}/image` : "/placeholder-image.jpg"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-40">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-white to-yellow-50 rounded-t-xl">
                  <p className="text-sm font-semibold text-gray-900">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>

                <button
                  onClick={handleViewProfile}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 transition-colors duration-200"
                >
                  <User className="h-4 w-4 text-yellow-600" />
                  Subir Imagen
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de subir imagen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Subir Imagen de Perfil</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`px-4 py-2 bg-yellow-400 text-gray-900 rounded hover:bg-yellow-500 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
