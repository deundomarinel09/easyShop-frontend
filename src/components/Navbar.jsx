import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const baseLinkClass =
    "text-gray-700 hover:text-blue-600 hover:bg-blue-200 px-3 py-1 rounded transition-all duration-300 transform hover:scale-110";
  const activeLinkClass =
    "text-blue-700 font-bold bg-blue-300 px-3 py-1 rounded transform scale-110 transition-all duration-300";

  return (
    <nav
      className={`bg-blue-100 shadow-md border-b sticky top-0 z-50 transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Name */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-blue-800 font-extrabold text-3xl tracking-wide hover:text-blue-900 transition-all duration-300 transform hover:scale-110"
            >
              Easy Shop
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Always visible links */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? activeLinkClass : baseLinkClass
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? activeLinkClass : baseLinkClass
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? activeLinkClass : baseLinkClass
              }
            >
              Orders
            </NavLink>

            {/* Show cart, email, and logout ONLY if logged in */}
            {user && (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    isActive
                      ? "relative text-blue-700 font-bold bg-blue-300 px-3 py-1 rounded transform scale-110 transition-all duration-300"
                      : "relative text-gray-700 hover:text-blue-600 hover:bg-blue-200 px-3 py-1 rounded transition-all duration-300 transform hover:scale-110"
                  }
                >
                  <ShoppingCartIcon className="h-6 w-6 inline-block" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {cart.length}
                    </span>
                  )}
                </NavLink>

                <span className="text-blue-700 font-semibold px-3 py-1 rounded truncate max-w-xs">
                  {user.email}
                </span>

                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-110 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Navbar Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => alert("Open mobile menu")}
              className="text-gray-700 hover:text-gray-900 transition-all duration-300 transform hover:scale-110"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
