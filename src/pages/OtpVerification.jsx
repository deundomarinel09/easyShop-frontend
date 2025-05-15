import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../apiData/login';
import { useAuth } from '../context/AuthContext';

export default function OtpVerification() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = location.state?.email;

  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingVerify(true);
    setError('');
    const joinedOtp = otp.join('');

    try {
      const res = await verifyOtp(passedEmail, joinedOtp);

      if (res?.message === "OTP verified") {
        const updatedUser = {
          email: res?.user?.email,
          isOtpRequired: false,
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/');
      } else {
        setError(res?.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoadingVerify(false);
  };

  const handleResendOtp = async () => {
    setLoadingResend(true);
    setError('');

    try {
      const res = await resendOtp(passedEmail);

      if (res?.message === "OTP resent successfully.") {
        setOtpResent(true);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
      } else {
        setError(res?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    }

    setLoadingResend(false);
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
          <label className="block text-gray-700 mb-2 text-center">OTP</label>
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[idx] = el)}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl"
                required
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          disabled={loadingVerify || loadingResend}
        >
          {loadingVerify ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          className="w-full bg-gray-600 text-white py-2 rounded-lg mt-4 hover:bg-gray-700"
          disabled={loadingVerify || loadingResend}
        >
          {loadingResend ? 'Resending...' : 'Resend OTP'}
        </button>

        {otpResent && (
          <div className="text-green-600 mt-2 text-center">
            OTP resent successfully! Please check your email.
          </div>
        )}
      </form>
    </div>
  );
}
