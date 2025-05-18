import React from 'react';
import { Clock } from 'lucide-react';

export const Promotions = () => {
  return (
    <section className="py-16 container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl overflow-hidden shadow-xl">
          <div className="p-8 md:p-10 relative">
            <div className="max-w-md">
              <span className="inline-block px-3 py-1 bg-white text-rose-600 rounded-full text-sm font-semibold mb-4">Limited Time Offer</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Summer Sale</h3>
              <p className="text-white text-opacity-90 mb-6">
                Get up to 50% off on all summer essentials. Don't miss out on these amazing deals!
              </p>
              <div className="flex space-x-3 mb-6">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-2xl font-bold text-white">02</span>
                  <span className="text-white text-opacity-80 text-sm">Days</span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-2xl font-bold text-white">18</span>
                  <span className="text-white text-opacity-80 text-sm">Hours</span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-2xl font-bold text-white">45</span>
                  <span className="text-white text-opacity-80 text-sm">Mins</span>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[70px]">
                  <span className="block text-2xl font-bold text-white">22</span>
                  <span className="text-white text-opacity-80 text-sm">Secs</span>
                </div>
              </div>
              <a 
                href="/sale" 
                className="inline-block bg-white text-rose-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Shop Now
              </a>
            </div>
            <div className="hidden md:block absolute -bottom-10 right-0">
              <div className="relative w-40 h-40 rounded-full bg-white bg-opacity-10"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl overflow-hidden shadow-xl">
          <div className="p-8 md:p-10 relative">
            <div className="max-w-md">
              <span className="inline-block px-3 py-1 bg-white text-amber-600 rounded-full text-sm font-semibold mb-4">New Arrivals</span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Tech Gadgets Collection</h3>
              <p className="text-white text-opacity-90 mb-6">
                Discover the latest tech gadgets that will revolutionize your daily life. Stay ahead with cutting-edge technology.
              </p>
              <div className="flex items-center mb-6">
                <Clock size={20} className="text-white mr-2" />
                <span className="text-white text-opacity-90">Just Launched</span>
              </div>
              <a 
                href="/new-arrivals" 
                className="inline-block bg-white text-amber-600 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Explore Collection
              </a>
            </div>
            <div className="hidden md:block absolute -bottom-10 right-0">
              <div className="relative w-40 h-40 rounded-full bg-white bg-opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};