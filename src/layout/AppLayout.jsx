import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";

export default function AppLayout() {
    return (
        <CartProvider>

        <AuthProvider>
                <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                        <Outlet />
                    </main>
                </div>
        </AuthProvider>
        </CartProvider>

    );
}
