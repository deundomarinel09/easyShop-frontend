import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // 👈 Make sure this is installed: `npm install lucide-react`

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { success, message } = await signup(email, password, firstName, lastName, phoneNumber);

    if (!success) {
      setError(message || 'An unknown error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">
            Phone Number <span className="text-red-500">*</span>{' '}
            <span className="text-sm text-gray-500">(e.g., 09XXXXXXXXX)</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
            pattern="^09\d{9}$"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4 relative">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-9 right-3 text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-9 right-3 text-gray-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
