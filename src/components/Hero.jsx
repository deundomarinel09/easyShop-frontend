import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const imagePaths = [
  '/XIASTORE.jpg',
  '/store2logo.jpg',
  '/storelogo.jpg',
];

export const Hero = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    }, 3000); // 5 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <div className="relative min-h-[600px] flex items-center bg-gradient-to-r from-teal-500 to-teal-600 overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-white bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Shop Smarter, <br />
              <span className="text-amber-300">Not Harder</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-md">
              Discover amazing products with unbeatable prices. Shop with confidence and ease at Easy Shop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-white text-teal-600 px-8 py-3 rounded-full font-medium text-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                Shop Now
                <ArrowRight className="ml-2" size={20} />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium text-lg inline-flex items-center justify-center hover:bg-white hover:text-teal-600 transition-colors duration-300"
              >
                Browse Categories
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-16 -right-16 w-[500px] h-[500px] bg-amber-300 rounded-full opacity-20"></div>
            <img
              src={imagePaths[currentImageIndex]}
              alt="Shopping Experience"
              className="relative z-10 rounded-lg shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500"
            />
            {/* <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center space-x-2 text-teal-600 font-medium">
                <span className="text-lg">New Summer Collection</span>
                <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full">HOT</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}></div>
    </div>
  );
};
