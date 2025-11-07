import React from "react";
import { useNavigate } from "react-router-dom";
// Importa la imagen
import backgroundImage from "../../assets/arepitas.jpg"; // Ajusta la ruta según tu estructura
import Logo from "../../assets/Designer.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex">
        {/* Left Side - Welcome Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Content Container */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden">
                  <img 
                    src={Logo} 
                    alt="Secure Ecommerce Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome to Secure Ecommerce
                </h2>
                <p className="text-gray-600 mt-2">
                  Please choose an option to continue
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <button
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 focus:ring-4 focus:ring-red-600 focus:ring-opacity-50 transition-colors"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="w-full bg-white text-red-600 border border-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 focus:ring-4 focus:ring-red-600 focus:ring-opacity-50 transition-colors"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center w-[200px] h-[930px]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          <div className="h-full bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-12">
              <h2 className="text-4xl font-bold mb-6">Secure Ecommerce</h2>
              <p className="text-xl">
                Your trusted platform for safe online shopping
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}