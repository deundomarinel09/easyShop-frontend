import { useEffect } from 'react';
import {  } from 'react-router-dom';
import backgroundImage from '../assets/mariton.jpg';

export default function Home() {
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
  }, []);

  return (
    <div
      className="relative text-center min-h-[80vh] bg-contain bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Content Overlay */}
      <div className="bg-black bg-opacity-50 p-8 rounded-lg max-w-2xl mx-auto text-white flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Welcome to Mariton Grocery
        </h1>
        <p className="text-xl mb-8">
          Discover groceries at amazing prices!
        </p>
        <Link
          to="/products"
          className="bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-all duration-300 text-lg"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
