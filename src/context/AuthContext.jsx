import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import useCart to access the clearCart function
import { fetchLogin, fetchCreateAccount } from '../apiData/login'; // adjust path if needed

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { clearCart } = useCart(); // Get the clearCart function from CartContext
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const res = await fetchLogin({ email, password });
      const userData = res.data;

      // Store full user data in localStorage
      const fullUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      navigate('/');  // Redirect after successful login
      return true;
    } catch (err) {
      return false;
    }
  };

  const signup = async (email, password) => {
    try {
      const newUser = {
        name: email.split('@')[0],  // Just an example of setting name
        email,
        passwordhash: password,
        createdate: new Date().toISOString(),
        role: "user",  // Default role, modify as needed
      };

      const res = await fetchCreateAccount(newUser);
      const userData = res.data;

      navigate('/login');  // Redirect after successful sign up
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data || err.message || 'SignUp failed.';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    clearCart(); // Call clearCart to remove cart items
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
