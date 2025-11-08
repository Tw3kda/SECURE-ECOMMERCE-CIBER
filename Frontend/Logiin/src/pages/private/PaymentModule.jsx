import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { getKeycloak } from "../../keycloak";

const PaymentModule = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const keycloak = getKeycloak();

  const [clientData, setClientData] = useState(null);
  const [useCoupon, setUseCoupon] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [ccv, setCcv] = useState(""); // ✅ CCV input
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const total = getCartTotal();
  const discount = useCoupon ? total * 0.1 : 0;
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
        setUseCoupon(data.usoCodigoDescuento || false);
      } catch (err) {
        console.error(err);
      }
    };
    if (keycloak?.tokenParsed?.sub) fetchClientData();
  }, [keycloak]);

  // Handle payment
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

    const requestBody = {
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      ccv, // ✅ Include CCV
      amount: totalWithDiscount,
      currency: "USD", // ✅ Auto-set to USD
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
      usedCoupon: useCoupon,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/save`,
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

      setMessage(
        `Pago realizado con éxito. ID de transacción: ${data.transactionId}`
      );
      clearCart();

      // Update coupon on backend if used
      if (useCoupon) {
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
            console.log("✅ Cupón actualizado a true correctamente.");
            setClientData((prev) => ({ ...prev, usoCodigoDescuento: true }));
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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pago</h1>

      {/* Coupon */}
      <div className="mb-4 p-3 bg-gray-50 border rounded">
        <h2 className="font-semibold">Cupón de descuento</h2>
        {clientData ? (
          clientData.usoCodigoDescuento ? (
            <p className="text-gray-600">Cupón ya utilizado ✅</p>
          ) : (
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={useCoupon}
                onChange={(e) => setUseCoupon(e.target.checked)}
              />
              <span>Usar cupón de 10% de descuento</span>
            </label>
          )
        ) : (
          <p className="text-gray-500">Cargando información del cupón...</p>
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
        {discount > 0 && (
          <p className="text-green-600 mt-2">
            Descuento aplicado: -${discount.toFixed(2)}
          </p>
        )}
        <p className="text-xl font-bold mt-2">
          Total: ${totalWithDiscount.toFixed(2)}
        </p>
      </div>

      {/* Payment Form */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Dirección</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ingresa tu dirección"
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Número de tarjeta</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="XXXX XXXX XXXX XXXX"
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Nombre del titular</label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Nombre como aparece en la tarjeta"
          className="w-full border rounded p-2"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Mes</label>
          <input
            type="text"
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(e.target.value)}
            placeholder="MM"
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Año</label>
          <input
            type="text"
            value={expiryYear}
            onChange={(e) => setExpiryYear(e.target.value)}
            placeholder="YYYY"
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">CCV</label>
          <input
            type="text"
            value={ccv}
            onChange={(e) => setCcv(e.target.value)}
            placeholder="XXX"
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition"
      >
        {loading ? "Procesando..." : "Pagar Ahora"}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default PaymentModule;
