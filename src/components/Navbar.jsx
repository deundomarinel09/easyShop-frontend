import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 50) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`bg-white shadow-md border-b sticky top-0 z-50 transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Name */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-3xl font-extrabold text-gray-800 tracking-wide hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
            >
              Easy Shop
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
            >
              Products
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
            >
              Orders
            </Link>

            {/* Cart Icon with Item Count */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
            >
              <ShoppingCartIcon className="h-6 w-6 transform hover:scale-110 transition-all duration-200" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User-specific Links */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-blue-600 font-semibold">{user.email}</span> {/* Blue email with bold font */}
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-110"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-110"
                >
                  Logout
                </button> {/* Red logout button */}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-all duration-300 transform hover:scale-110"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-600 hover:text-gray-900 transition-all duration-300 transform hover:scale-110"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navbar Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => alert("Open mobile menu")}
              className="text-gray-600 hover:text-gray-900 transition-all duration-300 transform hover:scale-110"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
