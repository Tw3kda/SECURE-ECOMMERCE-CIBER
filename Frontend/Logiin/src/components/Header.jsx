import React, { useState, useRef, useEffect } from "react";
import { ShoppingBag, User, LogOut } from "lucide-react";
import CartDrawer from "./ui/cartDrawer";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    setIsMenuOpen(false);
  };

  const handleViewProfile = () => {
    console.log("Viendo perfil...");
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/70 backdrop-bl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Arepa Sunshine
              </h1>
              <p className="text-xs text-yellow-600 font-medium">
                Corner Shop Delights
              </p>
            </div>
          </div>
          
          {/* Navegación y controles */}
          <div className="flex items-center gap-6">
            {/* Enlaces de navegación */}
            <a href="#productos" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors duration-200">
              Productos
            </a>
            <a href="#nosotros" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors duration-200">
              Nosotros
            </a>
            <a href="#contacto" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors duration-200">
              Contacto
            </a>

            {/* Carrito */}
            <CartDrawer />

            {/* Icono de usuario */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-yellow-100 transition-colors duration-200 border-2 border-gray-200 hover:border-yellow-300"
              >
                <User className="h-5 w-5 text-gray-600 hover:text-yellow-600" />
              </button>

              {/* Menú desplegable */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-40">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-white to-yellow-50 rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-900">Mi Cuenta</p>
                    <p className="text-xs text-gray-500">usuario@ejemplo.com</p>
                  </div>

                  <button
                    onClick={handleViewProfile}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 transition-colors duration-200"
                  >
                    <User className="h-4 w-4 text-yellow-600" />
                    Ver Perfil
                  </button>

                  <button
                    onClick={handleLogout}
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
      </div>
    </nav>
  );
}