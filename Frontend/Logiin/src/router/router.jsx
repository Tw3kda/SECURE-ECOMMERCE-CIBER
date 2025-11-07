import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../pages/public/Home.jsx";
import Login from "../pages/public/Login.jsx";
import Signup from "../pages/public/Signup.jsx";
import Dashboard from "../pages/private/Dashboard.jsx";
import PaymentModule from "../pages/private/PaymentModule.jsx";
import CreateProduct from "../pages/private/CreateProduct.jsx";
import ProtectedRoutes from "./protectedRoutes.jsx";
import PublicRoute from "./PublicRoute.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Home />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoutes>
        <Dashboard />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/CreateProduct",
    element: (
      <ProtectedRoutes>
        <CreateProduct />
      </ProtectedRoutes>
    ),
  },
   {
    path: "/PaymentModule",
    element: (
      <ProtectedRoutes>
        <PaymentModule />
      </ProtectedRoutes>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
