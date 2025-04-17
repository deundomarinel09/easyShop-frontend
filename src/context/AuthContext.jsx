import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLogin, fetchCreateAccount } from '../apiData/login'; // adjust path if needed


const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const res = await fetchLogin({ email, password });
      const userData = res.data;


      const isAdmin = userData?.role === "admin";

      setUser({ email: userData.email, isAdmin });
      localStorage.setItem('user', JSON.stringify({ email: userData.email, isAdmin }));
      navigate('/');
      return true;
    } catch (err) {
      return false;
    }
  };
  const signup = async (email, password) => {
    try {
      const newUser = {
        name: email.split('@')[0],
        email,
        passwordhash: password,
        createdate: new Date().toISOString(),
        role: "user"
      };

      const res = await fetchCreateAccount(newUser);
      const userData = res.data;

      navigate('/login');
      return { success: true };

    } catch (err) {
      const errorMsg = err.response?.data || err.message || 'SignUp failed.';
      return { success: false, message: errorMsg };  // Return the error message
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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