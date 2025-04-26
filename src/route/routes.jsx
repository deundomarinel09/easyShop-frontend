//routes.jsx
import {
    createBrowserRouter,
    Navigate
  } from "react-router-dom";
  
  import AppLayout from "../layout/AppLayout"; // a new layout to wrap common UI
  import Home from "../pages/Home";
  import Products from "../pages/Products";
  import Cart from "../pages/Cart";
  import Checkout from "../pages/Checkout";
  import Login from "../pages/Login";
  import Signup from "../pages/Signup";
  import AdminDashboard from "../pages/AdminDashboard";
  import ProtectedRoute from "../components/ProtectedRoute";
  import AdminRoute from "../components/AdminRoute";
  import NotFound from "../pages/NotFound"; // 404 Page
  import Orders from "../pages/Orders";
  import Otp from "../pages/OtpVerification";
  
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
        {path: "otp", element: <Otp />},
        {
          path: "products",
          element: (
              <Products />
          ),
        },
        {
          path: "cart",
          element: (
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          ),
        },
        {
            path: "orders",
            element: (
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            ),
          },
        {
          path: "checkout",
          element: (
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin",
          element: (
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          ),
        },
        { path: "*", element: <NotFound /> }, // For handling 404 errors
      ],
    },
  ]);
  
  export default router;
  