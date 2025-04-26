import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Redirect to login if no user is logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user is logged in but hasn't verified OTP, redirect them to OTP page
  if (user.isOtpRequired) {
    return <Navigate to="/otp" />;
  }

  return children;
}
