// src/screens/PaymentModule.jsx
import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { getKeycloak } from "../../keycloak";
import pago from "../../assets/pago.jpg";
import { useNavigate } from "react-router-dom";

const PaymentModule = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const keycloak = getKeycloak();
  const navigate = useNavigate(); // Hook para navegación


  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = getCartTotal();
  const discount = cart.some(item => item.usedCoupon) ? total * 0.1 : 0;
  const totalWithDiscount = total - discount;

  const handlePayment = async () => {
    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !direccion) {
      setMessage("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setMessage("");

    const requestBody = {
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      amount: totalWithDiscount,
      currency: "COP",
      items: JSON.stringify(cart.map((p) => ({ id: p.id, name: p.name, quantity: p.quantity, price: p.price }))),
      direccion,
      clientDataId: keycloak?.tokenParsed?.sub || null,
      usedCoupon: cart.some(item => item.usedCoupon),
    };

    try {
      const response = await fetch("/api/payments/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak?.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Error al procesar el pago");

      const data = await response.json();
      setMessage(`Pago realizado con éxito. ID de transacción: ${data.transactionId}`);
      clearCart();
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      className="min-h-screen py-8"
      style={{
        backgroundImage: "url('" + pago + "')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <button
        onClick={() => navigate("/dashboard")} // Cambia "/dashboard" por tu ruta
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
        title="Volver al Dashboard"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
            <h1 className="text-3xl font-bold text-black mb-6 text-center drop-shadow-lg">Proceso de Pago</h1>

            {/* Resumen del Carrito */}
            <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumen de tu Compra</h2>
              <ul className="divide-y divide-gray-200">
                {cart.map(item => (
                  <li key={item.id} className="flex justify-between items-center py-3">
                    <div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              {discount > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 font-semibold">🎉 Descuento aplicado: -${discount.toFixed(2)}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xl font-bold text-gray-800">Total: ${totalWithDiscount.toFixed(2)}</p>
              </div>
            </div>

            {/* Información de Envío */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Envío</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ingresa tu dirección completa"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Información de Pago */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Pago</h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Titular</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Nombre como aparece en la tarjeta"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mes de Expiración</label>
                  <input
                    type="text"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    placeholder="MM"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Año de Expiración</label>
                  <input
                    type="text"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    placeholder="YYYY"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Botón de Pago */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando Pago...
                </div>
              ) : (
                "Pagar Ahora"
              )}
            </button>

            {message && (
              <div className={`mt-6 p-4 rounded-lg text-center font-semibold ${message.includes("éxito")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModule;