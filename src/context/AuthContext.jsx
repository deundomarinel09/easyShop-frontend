import { createContext, useContext, useState } from 'react';
import {  } from 'react-router-dom';
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
  
      // Check if the server is requesting OTP verification
      if (userData?.message === "OTP sent to email.") {
        return { success: true, step: "otp" }; // Redirect to OTP page
      }
  
      // Otherwise, proceed with normal login
      const fullUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isOtpRequired: false, // No OTP needed
      };
  
      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      navigate('/');  // Redirect after successful login
      return { success: true }; // Successful login without OTP
    } catch (err) {
      return { success: false };
    }
  };

  const signup = async (email, password, firstName, lastName, phoneNumber) => {
    try {
      const newUser = {
        email,
        passwordhash: password,
        firstname: firstName,
        lastname: lastName,
        phonenumber: phoneNumber,
        createdate: new Date().toISOString(),
        role: "user",
      };
  
      const res = await fetchCreateAccount(newUser);
      const userData = res.data;
  
      navigate('/login');
      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.title ||
        err.response?.data?.message ||
        err.message ||
        'SignUp failed.';
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
    <AuthContext.Provider value={{ user, setUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
