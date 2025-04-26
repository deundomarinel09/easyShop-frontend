import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../apiData/login';
import { useAuth } from '../context/AuthContext';

export default function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const email = user?.email || storedUser?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await verifyOtp(email, otp); // use email from context or localStorage
      if (res?.success) {
        const updatedUser = { ...storedUser, isOtpRequired: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        user.isOtpRequired = false;
        navigate('/');
      } else {
        setError('Invalid or expired OTP.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Enter OTP</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="otp">
            OTP
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
}
