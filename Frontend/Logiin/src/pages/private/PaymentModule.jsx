import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { getKeycloak } from "../../keycloak";
import pago from "../../assets/pago.jpg";
import { useNavigate } from "react-router-dom";

const PaymentModule = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const keycloak = getKeycloak();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(null);
  const [useCoupon, setUseCoupon] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [ccv, setCcv] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  // Calcular totales BASADOS EN SI EL CUPÓN ESTÁ DISPONIBLE
  const total = getCartTotal();
  const canUseCoupon = clientData && !clientData.usoCodigoDescuento;
  const discount = useCoupon && canUseCoupon ? total * 0.1 : 0;
  const totalWithDiscount = total - discount;

  // Fetch client data to check coupon state
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client-data/${
            keycloak?.tokenParsed?.sub
          }`,
          {
            headers: {
              Authorization: `Bearer ${keycloak?.token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Error al obtener ClientData");
        const data = await res.json();
        console.log(
          "🧾 Estado del cupón del usuario:",
          data.usoCodigoDescuento
        );
        setClientData(data);
        // Solo permitir usar cupón si no ha sido usado
        setUseCoupon(false); // Resetear a false al cargar
      } catch (err) {
        console.error(err);
      }
    };
    if (keycloak?.tokenParsed?.sub) fetchClientData();
  }, [keycloak]);

  // Redirección automática después del éxito
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 3000); // 3 segundos antes de redirigir

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, navigate]);

  const handlePayment = async () => {
    if (
      !cardNumber ||
      !cardholderName ||
      !expiryMonth ||
      !expiryYear ||
      !ccv ||
      !direccion
    ) {
      setMessage("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setMessage("");

    const actuallyUsedCoupon = useCoupon && canUseCoupon;

    const requestBody = {
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      ccv,
      amount: totalWithDiscount,
      currency: "USD",
      items: JSON.stringify(
        cart.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          price: p.price,
        }))
      ),
      direccion,
      clientDataId: keycloak?.tokenParsed?.sub || null,
      usedCoupon: actuallyUsedCoupon,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keycloak?.token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Error al procesar el pago");

      const data = await response.json();

      // Guardar datos de la transacción para el popup
      setTransactionData({
        transactionId: data.transactionId,
        amount: totalWithDiscount,
        items: cart.length,
      });

      // Mostrar popup de éxito
      setShowSuccessPopup(true);
      clearCart();

      // ✅ Solo actualizar cupón si pago fue exitoso y se seleccionó
      if (actuallyUsedCoupon) {
        try {
          const updateRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/client-data/${
              keycloak?.tokenParsed?.sub
            }/toggle-coupon?useCoupon=true`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${keycloak?.token}` },
            }
          );
          if (updateRes.ok) {
            console.log("✅ Cupón actualizado correctamente.");
            setClientData((prev) => ({ ...prev, usoCodigoDescuento: true }));
            setUseCoupon(false);
          }
        } catch (err) {
          console.error("⚠️ Error al actualizar el cupón:", err);
        }
      }
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
        backgroundAttachment: "fixed",
      }}
    >
      {/* Popup de éxito */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
            <div className="text-center">
              {/* Icono de éxito */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Pago Exitoso!
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-600 mb-2">
                  <strong>ID de Transacción:</strong>{" "}
                  {transactionData?.transactionId}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Total Pagado:</strong> $
                  {transactionData?.amount?.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  <strong>Productos:</strong> {transactionData?.items} items
                </p>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Serás redirigido automáticamente al dashboard en 3 segundos...
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Volver al Dashboard Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        className="fixed top-4 right-4 z-40 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
        title="Volver al Dashboard"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
            <h1 className="text-3xl font-bold text-black mb-6 text-center drop-shadow-lg">
              Proceso de Pago
            </h1>

            {/* Coupon */}
            <div className="mb-4 p-3 bg-gray-50 border rounded">
              <h2 className="font-semibold">Cupón de descuento</h2>
              {clientData ? (
                clientData.usoCodigoDescuento ? (
                  <div className="mt-2">
                    <p className="text-gray-600 mb-2">Cupón ya utilizado ✅</p>
                    <p className="text-sm text-gray-500">
                      Has utilizado tu cupón de descuento del 10% en una compra
                      anterior.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useCoupon}
                        onChange={(e) => setUseCoupon(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Usar cupón de 10% de descuento</span>
                    </label>
                    <p className="text-sm text-green-600 mt-1">
                      ¡Tienes un cupón disponible! Ahorra $
                      {(total * 0.1).toFixed(2)}
                    </p>
                  </div>
                )
              ) : (
                <p className="text-gray-500">
                  Cargando información del cupón...
                </p>
              )}
            </div>

            {/* Items */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Items del carrito</h2>
              <ul className="divide-y divide-gray-200 border rounded-lg">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between p-3">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              {/* Mostrar descuento solo si está disponible y seleccionado */}
              {canUseCoupon && useCoupon && (
                <div className="mt-2 space-y-1">
                  <p className="text-green-600">
                    Descuento aplicado: -${discount.toFixed(2)}
                  </p>
                  <p className="text-gray-500 line-through">
                    Total sin descuento: ${total.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Mostrar mensaje si el cupón ya fue usado */}
              {clientData?.usoCodigoDescuento && (
                <p className="text-gray-500 mt-2">
                  Cupón no disponible (ya utilizado)
                </p>
              )}

              <p className="text-xl font-bold mt-2">
                Total a pagar: ${totalWithDiscount.toFixed(2)}
              </p>
            </div>

            {/* Información de Envío */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dirección de Envío
              </label>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Información de Pago
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Nombre como aparece en la tarjeta"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mes de Expiración
                  </label>
                  <input
                    type="text"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    placeholder="MM"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Año de Expiración
                  </label>
                  <input
                    type="text"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    placeholder="YYYY"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CCV
                  </label>
                  <input
                    type="text"
                    value={ccv}
                    onChange={(e) => setCcv(e.target.value)}
                    placeholder="XXX"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando Pago...
                </div>
              ) : (
                "Pagar Ahora"
              )}
            </button>

            {message && (
              <div
                className={`mt-6 p-4 rounded-lg text-center font-semibold ${
                  message.includes("éxito")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
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
