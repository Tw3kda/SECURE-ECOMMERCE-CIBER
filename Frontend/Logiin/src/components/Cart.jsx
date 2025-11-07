import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import { QuantitySelector } from "./ui/QuantitySelector";
import { useNavigate } from "react-router-dom";

export function Cart({ onClose }) {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();

  const navigate = useNavigate();

  const goToPayment = () => {
    navigate("/PaymentModule");
  };

  if (cart.length === 0) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">El carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {cart.map((item) => (
        <Card key={item.id} className="mb-4 p-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">${item.price}</p>
            </div>
            <QuantitySelector
              quantity={item.quantity}
              onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
              onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
              onRemove={() => removeFromCart(item.id)}
            />
          </div>
        </Card>
      ))}
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total:</span>
          <span className="font-semibold">${getCartTotal()}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearCart} variant="destructive" className="w-full">
            Vaciar Carrito
          </Button>
          <Button className="w-full">Proceder al Pago</Button>
        </div>
      </div>
    </div>
  );
}
