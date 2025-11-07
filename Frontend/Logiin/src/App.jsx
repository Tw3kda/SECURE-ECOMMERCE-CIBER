import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router.jsx";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
