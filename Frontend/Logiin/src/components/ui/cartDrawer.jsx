import React, { useState } from "react";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getKeycloak } from "../../keycloak";

const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const keycloak = getKeycloak();
  const total = getCartTotal();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePayment = async () => {
    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear) {
      setMessage("Por favor completa todos los campos de la tarjeta");
      return;
    }

    setLoading(true);
    setMessage("");

    const requestBody = {
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      amount: total,
      currency: "COP",
      items: JSON.stringify(cart.map((p) => ({ id: p.id, name: p.name, quantity: p.quantity, price: p.price }))),
      direccion: "Calle Falsa 123",
      clientDataId: keycloak?.tokenParsed?.sub || null,
      usedCoupon: false,
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
      setIsPaymentOpen(false);
      setCardNumber("");
      setCardholderName("");
      setExpiryMonth("");
      setExpiryYear("");
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón del carrito */}
      <button
        type="button"
        aria-label="Abrir carrito"
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-yellow-600 transition-colors duration-200"
      >
        <ShoppingBag className="h-6 w-6" aria-hidden="true" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>

{/* Overlay único */}
{isOpen && (
  <div
    className="fixed inset-0 z-40 backdrop-blur-sm bg-white/10"
    role="presentation"
    aria-label="Cerrar carrito"
    onClick={() => setIsOpen(false)}
  />
)}


      {/* Drawer del carrito */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
              {cart.length > 0 && (
                <p className="text-sm text-gray-500">
                  {cart.reduce((total, item) => total + item.quantity, 0)} items
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-yellow-100 rounded-full transition-colors duration-200"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="p-4 bg-yellow-50 rounded-full mb-4">
                <ShoppingBag className="h-12 w-12 text-yellow-400" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">Carrito vacío</p>
              <p className="text-sm text-center text-gray-500">
                Agrega productos a tu carrito
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-yellow-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-yellow-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 rounded-lg border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 transition-colors duration-200"
                    >
                      <Minus className="h-3 w-3 text-gray-600" />
                    </button>
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 font-medium rounded-lg min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 rounded-lg border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 transition-colors duration-200"
                    >
                      <Plus className="h-3 w-3 text-gray-600" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: botones abajo */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-6 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-yellow-600 block">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpiar
              </button>
<button
  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
  aria-label="Comprar Ahora"
  onClick={() => {
    setIsOpen(false); // cerramos el drawer
    navigate("/PaymentModule"); // redirigimos a la pantalla de pago
  }}
>
  Comprar Ahora
</button>

            </div>
          </div>
        )}
      </div>



    </>
  );
};

export default CartDrawer;
